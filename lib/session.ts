export const SESSION_COOKIE = "uiatan_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  v: 1;
  iat: number;
  exp: number;
  nonce: string;
};

const encoder = new TextEncoder();
let cachedSecret: string | null = null;
let cachedKeyPromise: Promise<CryptoKey> | null = null;

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): Uint8Array {
  const padded = `${base64Url.replace(/-/g, "+").replace(/_/g, "/")}${"=".repeat((4 - (base64Url.length % 4)) % 4)}`;
  return fromBase64(padded);
}

function parsePayload(input: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(input) as Partial<SessionPayload>;
    if (parsed.v !== 1) return null;
    if (typeof parsed.iat !== "number" || !Number.isFinite(parsed.iat)) return null;
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) return null;
    if (typeof parsed.nonce !== "string" || parsed.nonce.length < 16) return null;
    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  if (!cachedKeyPromise || cachedSecret !== secret) {
    cachedSecret = secret;
    cachedKeyPromise = crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }

  return cachedKeyPromise;
}

async function sign(input: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  return toBase64Url(new Uint8Array(signature));
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function createSessionToken(): Promise<string | null> {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: 1,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
    nonce: createNonce(),
  };

  const payloadBase64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(payloadBase64, secret);
  return `${payloadBase64}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  const [payloadBase64, signature] = parts;
  const expectedSignature = await sign(payloadBase64, secret);
  const signatureBytes = fromBase64Url(signature);
  const expectedBytes = fromBase64Url(expectedSignature);

  if (signatureBytes.length !== expectedBytes.length) {
    return false;
  }

  let isSignatureValid = true;
  for (let i = 0; i < signatureBytes.length; i += 1) {
    isSignatureValid = isSignatureValid && signatureBytes[i] === expectedBytes[i];
  }

  if (!isSignatureValid) {
    return false;
  }

  const payloadJson = new TextDecoder().decode(fromBase64Url(payloadBase64));
  const payload = parsePayload(payloadJson);
  if (!payload) return false;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return false;
  if (payload.iat > now + 60) return false;
  if (payload.exp - payload.iat > SESSION_MAX_AGE_SECONDS + 60) return false;

  return true;
}
