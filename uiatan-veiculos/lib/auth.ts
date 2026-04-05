import { cookies } from "next/headers";

const SESSION_COOKIE = "uiatan_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-secret-in-production";

export function getSessionToken(): string {
  // Simple hash: in production, use a proper HMAC
  return Buffer.from(SESSION_SECRET).toString("base64");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  return session.value === getSessionToken();
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function validateCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@uiatanveiculos.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return email === adminEmail && password === adminPassword;
}
