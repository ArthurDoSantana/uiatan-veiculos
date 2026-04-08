import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { applyRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

const PARALLELUM_BASE = "https://parallelum.com.br/fipe/api/v1";
const UPSTREAM_TIMEOUT_MS = 8000;
const FIPE_CODE_REGEX = /^[a-zA-Z0-9-]+$/;

type FipeAction = "plate" | "marcas" | "modelos" | "anos" | "preco";

type FipeTipo = "carros" | "motos" | "caminhoes";

const RATE_LIMIT_BY_ACTION: Record<FipeAction, { maxRequests: number; windowMs: number }> = {
  plate: { maxRequests: 20, windowMs: 60_000 },
  marcas: { maxRequests: 120, windowMs: 60_000 },
  modelos: { maxRequests: 120, windowMs: 60_000 },
  anos: { maxRequests: 120, windowMs: 60_000 },
  preco: { maxRequests: 60, windowMs: 60_000 },
};

class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function parseAction(value: string | null): FipeAction | null {
  if (value === "plate" || value === "marcas" || value === "modelos" || value === "anos" || value === "preco") {
    return value;
  }

  return null;
}

function parseTipo(value: string | null): FipeTipo | null {
  if (!value) return "carros";
  if (value === "carros" || value === "motos" || value === "caminhoes") return value;
  return null;
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
}

function jsonError(message: string, status: number, code?: string) {
  return NextResponse.json(code ? { error: message, code } : { error: message }, { status });
}

function sanitizeCodeParam(value: string | null, label: string): string {
  const normalized = value?.trim() || "";
  if (!normalized) {
    throw new ApiError(`${label} obrigatorio.`, 400);
  }
  if (!FIPE_CODE_REGEX.test(normalized)) {
    throw new ApiError(`${label} invalido.`, 400);
  }

  return normalized;
}

function applyActionRateLimit(request: NextRequest, action: FipeAction): NextResponse | null {
  const policy = RATE_LIMIT_BY_ACTION[action];
  const identifier = getRequestIdentifier(request.headers);
  const result = applyRateLimit({
    key: `api:fipe:${action}:${identifier}`,
    maxRequests: policy.maxRequests,
    windowMs: policy.windowMs,
  });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Muitas requisicoes. Tente novamente em instantes.",
        retryAfterSeconds: result.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }

  return null;
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(normalized)) {
    return true;
  }
  if (normalized.endsWith(".local")) {
    return true;
  }

  const ipv4Match = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) {
    return false;
  }

  const octets = ipv4Match.slice(1).map(Number);
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  if (octets[0] === 10 || octets[0] === 127 || octets[0] === 0) return true;
  if (octets[0] === 169 && octets[1] === 254) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

  return false;
}

function buildSafeProviderUrl(providerTemplate: string, plate: string): URL {
  const resolved = providerTemplate.includes("{plate}")
    ? providerTemplate.replace("{plate}", encodeURIComponent(plate))
    : `${providerTemplate}${providerTemplate.endsWith("/") ? "" : "/"}${encodeURIComponent(plate)}`;

  let parsed: URL;
  try {
    parsed = new URL(resolved);
  } catch {
    throw new ApiError("Configuracao de URL do provedor de placa invalida.", 500, "INVALID_PLATE_PROVIDER_URL");
  }

  if (parsed.protocol !== "https:") {
    throw new ApiError("Provedor de placa deve usar HTTPS.", 500, "INSECURE_PLATE_PROVIDER_URL");
  }

  if (isPrivateOrLocalHostname(parsed.hostname)) {
    throw new ApiError("Host de provedor de placa nao permitido.", 500, "UNSAFE_PLATE_PROVIDER_HOST");
  }

  return parsed;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Tempo limite excedido ao consultar servico externo.", 504);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function parseJsonSafely<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

async function fetchJsonOrThrow<T>(url: string, fallbackError: string): Promise<T> {
  const res = await fetchWithTimeout(
    url,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
    UPSTREAM_TIMEOUT_MS
  );

  if (!res.ok) {
    throw new ApiError(fallbackError, res.status === 404 ? 404 : 502);
  }

  const payload = parseJsonSafely<T>(await res.text());
  if (!payload) {
    throw new ApiError("Resposta invalida do servico externo.", 502);
  }

  return payload;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const action = parseAction(searchParams.get("action"));

  if (!action) {
    return jsonError("Action invalida.", 400);
  }

  const rateLimitResponse = applyActionRateLimit(request, action);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    if (action === "plate") {
      const plate = searchParams.get("plate")?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      if (!plate || plate.length !== 7) {
        return NextResponse.json({ error: "Placa invalida." }, { status: 400 });
      }

      const configuredTemplate = process.env.PLATE_LOOKUP_API_URL?.trim();
      const configuredToken = process.env.PLATE_LOOKUP_API_TOKEN?.trim();

      const providerTemplate = configuredTemplate ||
        (configuredToken
          ? `https://api.invertexto.com/v1/placa/{plate}?token=${configuredToken}`
          : "");

      if (!providerTemplate) {
        return jsonError(
          "Consulta por placa indisponivel no momento. Configure PLATE_LOOKUP_API_URL ou informe PLATE_LOOKUP_API_TOKEN para usar o provedor padrao.",
          501,
          "PLATE_PROVIDER_NOT_CONFIGURED"
        );
      }

      const providerUrl = buildSafeProviderUrl(providerTemplate, plate);

      const headers: HeadersInit = {};
      if (configuredToken && configuredTemplate) {
        headers.Authorization = `Bearer ${configuredToken}`;
      }

      const res = await fetchWithTimeout(
        providerUrl.toString(),
        { headers, cache: "no-store" },
        UPSTREAM_TIMEOUT_MS
      );

      const text = await res.text();
      const payload = parseJsonSafely<Record<string, unknown>>(text);

      if (!res.ok) {
        return jsonError(
          (payload?.message as string) ||
            (payload?.error as string) ||
            "Placa nao encontrada ou indisponivel no provedor.",
          res.status === 404 ? 404 : 502
        );
      }

      return NextResponse.json({ success: true, data: payload || { raw: text } });
    }

    if (action === "marcas") {
      const tipo = parseTipo(searchParams.get("tipo"));
      if (!tipo) {
        return jsonError("Tipo invalido.", 400);
      }

      const raw = await fetchJsonOrThrow<Array<{ codigo: number | string; nome: string }>>(
        `${PARALLELUM_BASE}/${tipo}/marcas`,
        "Falha ao listar marcas."
      );
      const data = raw.map((item) => ({ nome: item.nome, valor: String(item.codigo) }));
      return NextResponse.json({ success: true, data });
    }

    if (action === "modelos") {
      const tipo = parseTipo(searchParams.get("tipo"));
      if (!tipo) {
        return jsonError("Tipo invalido.", 400);
      }

      const marca = sanitizeCodeParam(searchParams.get("marca"), "Marca");

      const raw = await fetchJsonOrThrow<{
        modelos: Array<{ codigo: number | string; nome: string }>;
      }>(
        `${PARALLELUM_BASE}/${tipo}/marcas/${encodeURIComponent(marca)}/modelos`,
        "Falha ao listar modelos."
      );

      const data = {
        modelos: (raw.modelos || []).map((item) => ({ nome: item.nome, valor: String(item.codigo) })),
      };
      return NextResponse.json({ success: true, data });
    }

    if (action === "anos") {
      const tipo = parseTipo(searchParams.get("tipo"));
      if (!tipo) {
        return jsonError("Tipo invalido.", 400);
      }

      const marca = sanitizeCodeParam(searchParams.get("marca"), "Marca");
      const modelo = sanitizeCodeParam(searchParams.get("modelo"), "Modelo");

      const raw = await fetchJsonOrThrow<Array<{ codigo: string; nome: string }>>(
        `${PARALLELUM_BASE}/${tipo}/marcas/${encodeURIComponent(marca)}/modelos/${encodeURIComponent(modelo)}/anos`,
        "Falha ao listar anos."
      );

      const data = raw.map((item) => ({ nome: item.nome, valor: item.codigo }));
      return NextResponse.json({ success: true, data });
    }

    if (action === "preco") {
      const tipo = parseTipo(searchParams.get("tipo"));
      if (!tipo) {
        return jsonError("Tipo invalido.", 400);
      }

      const marca = sanitizeCodeParam(searchParams.get("marca"), "Marca");
      const modelo = sanitizeCodeParam(searchParams.get("modelo"), "Modelo");
      const ano = sanitizeCodeParam(searchParams.get("ano"), "Ano");

      const raw = await fetchJsonOrThrow<{
        Valor: string;
        Marca: string;
        Modelo: string;
        AnoModelo: number;
        Combustivel: string;
        CodigoFipe: string;
        MesReferencia: string;
      }>(
        `${PARALLELUM_BASE}/${tipo}/marcas/${encodeURIComponent(marca)}/modelos/${encodeURIComponent(modelo)}/anos/${encodeURIComponent(ano)}`,
        "Nao foi possivel obter o preco FIPE."
      );

      const data = {
        valor: raw.Valor,
        marca: raw.Marca,
        modelo: raw.Modelo,
        anoModelo: raw.AnoModelo,
        combustivel: raw.Combustivel,
        codigoFipe: raw.CodigoFipe,
        mesReferencia: raw.MesReferencia,
      };
      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status, error.code);
    }
    console.error("FIPE API error:", error instanceof Error ? error.message : error);
    return jsonError("Erro interno ao consultar FIPE.", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return unauthorizedResponse();
  }

  const rateLimitResult = applyRateLimit({
    key: `api:fipe:save:${getRequestIdentifier(request.headers)}`,
    maxRequests: 30,
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Muitas requisicoes. Aguarde antes de salvar novamente.",
        retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = (await request.json()) as {
      vehicleId?: string;
      fipePrice?: number;
      fipeCode?: string | null;
    };

    const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId.trim() : "";
    const fipePrice = typeof body.fipePrice === "number" ? body.fipePrice : Number.NaN;
    const fipeCode = typeof body.fipeCode === "string" ? body.fipeCode.trim() : null;

    if (!vehicleId || vehicleId.length > 100) {
      return NextResponse.json({ error: "vehicleId invalido." }, { status: 400 });
    }

    if (!Number.isFinite(fipePrice) || fipePrice <= 0) {
      return NextResponse.json({ error: "Dados invalidos para salvar FIPE." }, { status: 400 });
    }

    if (fipeCode && (!FIPE_CODE_REGEX.test(fipeCode) || fipeCode.length > 30)) {
      return NextResponse.json({ error: "Codigo FIPE invalido." }, { status: 400 });
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        fipePrice,
        fipeCode,
        fipeUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Veiculo nao encontrado." }, { status: 404 });
    }
    console.error("FIPE save error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Erro ao salvar valor FIPE." }, { status: 500 });
  }
}