import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { isAuthenticated } from "@/lib/auth";
import { applyRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return "image/gif";
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const rateLimit = applyRateLimit({
      key: `api:upload:${getRequestIdentifier(request.headers)}`,
      maxRequests: 30,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Muitas tentativas de upload. Tente novamente em instantes.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo inválido." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const detectedMimeType = detectMimeType(buffer);
    if (!detectedMimeType || !(detectedMimeType in MIME_EXTENSIONS)) {
      return NextResponse.json({ error: "Arquivo invalido ou corrompido." }, { status: 400 });
    }

    if (detectedMimeType !== file.type && !(detectedMimeType === "image/jpeg" && file.type === "image/jpg")) {
      return NextResponse.json({ error: "Tipo do arquivo nao confere com o conteudo." }, { status: 400 });
    }

    // Generate unique filename
    const ext = MIME_EXTENSIONS[detectedMimeType] || "jpg";
    const uniqueName = `${Date.now()}-${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Ensure uploads directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload." }, { status: 500 });
  }
}
