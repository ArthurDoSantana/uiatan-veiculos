export const SESSION_COOKIE = "uiatan_session";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getSessionToken(): Promise<string | null> {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) return null;

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return toHex(digest);
}
