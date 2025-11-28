import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that should not be accessible when authenticated
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
// Protected paths requiring authentication
const PROTECTED_PAGES = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Skip static files and API routes
  if (pathname.startsWith("/api") || pathname.startsWith("/public") || pathname.includes(".") ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const profileCompleted = (token as unknown as { profileCompleted?: boolean })?.profileCompleted || false;

  // If authenticated and visiting an auth page, redirect appropriately
  if (isAuth && AUTH_PAGES.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    if (profileCompleted) {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL("/onboarding/role", req.url);
      return NextResponse.redirect(url);
    }
  }

  // If not authenticated and visiting a protected page, redirect to login
  if (!isAuth && PROTECTED_PAGES.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    const loginUrl = new URL("/login", req.url);
    // Preserve original destination for post-login redirect
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated without completed profile and on dashboard, push to onboarding
  if (isAuth && !profileCompleted && pathname === "/dashboard") {
    const onboardUrl = new URL("/onboarding/role", req.url);
    return NextResponse.redirect(onboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
    "/dashboard/:path*",
  ],
};
