import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tsunami_super_secret_jwt_encryption_key_2026_syria"
);

const STAFF_JWT_SECRET = new TextEncoder().encode(
  process.env.STAFF_JWT_SECRET || "tsunami_isolated_staff_agent_security_key_2026_topup"
);

const ROOT_JWT_SECRET = new TextEncoder().encode(
  process.env.ROOT_ADMIN_SECRET || "tsunami_ultra_secure_super_admin_root_master_key_2026_syria"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, favicon, next assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/staff") ||
    pathname.startsWith("/api/root-admin/auth")
  ) {
    return NextResponse.next();
  }

  // Extract regular customer session token (supports NextAuth & Tsunami session cookies)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("tsunami_session")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  let authenticatedUser: any = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
      authenticatedUser = payload;
    } catch {
      // Invalid/expired token
    }
  }

  // 1. Military-Grade Root / Super-Admin Protection (/root-admin)
  if (pathname.startsWith("/root-admin")) {
    if (pathname === "/root-admin/login") {
      return NextResponse.next();
    }

    // Standard Admins (role: 'ADMIN') are strictly forbidden from accessing /root-admin
    if (authenticatedUser && authenticatedUser.role === "ADMIN") {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden: Root Fortress is strictly reserved for SUPER_ADMIN.",
          code: 403,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const rootToken = request.cookies.get("tsunami_root_token")?.value;
    let isRootValid = false;

    if (rootToken) {
      try {
        const { payload } = await jwtVerify(rootToken, ROOT_JWT_SECRET);
        if (payload?.isRoot && payload?.role === "SUPER_ADMIN") {
          isRootValid = true;
        }
      } catch {
        isRootValid = false;
      }
    }

    if (!isRootValid) {
      const acceptsHtml = request.headers.get("accept")?.includes("text/html");
      if (acceptsHtml) {
        return NextResponse.redirect(new URL("/root-admin/login", request.url));
      }
      return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
    }

    return NextResponse.next();
  }

  // 2. Permanently redirect legacy /root-control/* to unified canonical /root-admin/*
  if (pathname.startsWith("/root-control")) {
    let target = "/root-admin";
    if (pathname === "/root-control" || pathname === "/root-control/") {
      target = "/root-admin";
    } else if (pathname.startsWith("/root-control/banks") || pathname.startsWith("/root-control/payment-channels") || pathname.startsWith("/root-control/payments")) {
      target = "/root-admin/banks";
    } else if (pathname.startsWith("/root-control/audit-logs") || pathname.startsWith("/root-control/rates") || pathname.startsWith("/root-control/providers")) {
      target = "/root-admin/settings";
    } else if (pathname.startsWith("/root-control/staff")) {
      target = "/root-admin/admins";
    } else if (pathname.startsWith("/root-control/products")) {
      target = "/root-admin/catalog";
    } else {
      target = pathname.replace(/^\/root-control/, "/root-admin");
    }

    const redirectUrl = new URL(target, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 3. Dedicated Admin Dashboard Route Guarding (/admin)
  if (pathname.startsWith("/admin")) {
    if (!authenticatedUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("auth_required", "true");
      return NextResponse.redirect(loginUrl);
    }

    // Only role: 'ADMIN' or 'SUPER_ADMIN' allowed
    if (authenticatedUser.role !== "ADMIN" && authenticatedUser.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // 4. Strict Authentication Wall: Protected client routes
  const isProtectedStoreRoute =
    pathname.startsWith("/product") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/deposit");

  if (isProtectedStoreRoute && !authenticatedUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("auth_required", "true");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/product/:path*",
    "/wallet/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/deposit/:path*",
    "/root-control/:path*",
    "/root-admin/:path*",
  ],
};
