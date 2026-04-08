import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, createSession } from "@/lib/auth";
import { applyRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit({
    key: `api:auth:login:${getRequestIdentifier(request.headers)}`,
    maxRequests: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Muitas tentativas de login. Aguarde e tente novamente.",
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

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha sao obrigatorios." },
        { status: 400 }
      );
    }

    if (email.length > 254 || password.length > 200) {
      return NextResponse.json(
        { error: "Credenciais invalidas." },
        { status: 400 }
      );
    }

    const valid = validateCredentials(email, password);

    if (!valid) {
      return NextResponse.json(
        { error: "Credenciais invalidas." },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
