import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { SESSION_COOKIE, getSessionToken } from "@/lib/session";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  const token = await getSessionToken();
  if (!session) return false;
  if (!token) return false;
  return session.value === token;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = await getSessionToken();
  if (!token) {
    throw new Error("SESSION_SECRET não configurado.");
  }

  cookieStore.set(SESSION_COOKIE, token, {
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

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return safeCompare(normalizedEmail, adminEmail) && safeCompare(password, adminPassword);
}
