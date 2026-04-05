import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "uiatan_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-secret-in-production";

function getSessionToken(): string {
  return Buffer.from(SESSION_SECRET).toString("base64");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get(SESSION_COOKIE);
    const isValid = session?.value === getSessionToken();

    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/admin/login") {
    const session = request.cookies.get(SESSION_COOKIE);
    const isValid = session?.value === getSessionToken();

    if (isValid) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
