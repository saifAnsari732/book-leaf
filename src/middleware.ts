import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { applySecurityHeaders, validateCsrfOrigin } from "./lib/security";

const ACCESS_COOKIE = "bookleaf_access_token";
const SESSION_COOKIE = "bookleaf_session";
const REFRESH_COOKIE = "bookleaf_refresh_token";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    "bookleaf-dev-session-secret-change-in-production-2026";
  return new TextEncoder().encode(secret);
}

function getRefreshSecretKey(): Uint8Array {
  const secret =
    process.env.REFRESH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    "bookleaf-dev-refresh-secret-change-in-production-2026";
  return new TextEncoder().encode(secret);
}

interface DecodedToken {
  user_id: string;
  role: "AUTHOR" | "ADMIN";
  email: string;
}

async function verifyToken(req: NextRequest): Promise<DecodedToken | null> {
  const token =
    req.cookies.get(ACCESS_COOKIE)?.value ||
    req.cookies.get(SESSION_COOKIE)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      if (
        typeof payload.user_id === "string" &&
        (payload.role === "AUTHOR" || payload.role === "ADMIN")
      ) {
        return {
          user_id: payload.user_id,
          role: payload.role as "AUTHOR" | "ADMIN",
          email: typeof payload.email === "string" ? payload.email : "",
        };
      }
    } catch {
      // Continue to check refresh token
    }
  }

  // Fallback to refresh token if access token has expired
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, getRefreshSecretKey());
      if (
        typeof payload.user_id === "string" &&
        (payload.role === "AUTHOR" || payload.role === "ADMIN")
      ) {
        return {
          user_id: payload.user_id,
          role: payload.role as "AUTHOR" | "ADMIN",
          email: typeof payload.email === "string" ? payload.email : "",
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. CSRF & Cross-Site Origin Verification on Mutating State Requests
  const csrfCheck = validateCsrfOrigin(req);
  if (!csrfCheck.valid) {
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: csrfCheck.reason || "Forbidden: CSRF protection triggered",
      },
      { status: 403 }
    );
    return applySecurityHeaders(errorResponse, { isApiRoute: true });
  }

  // 2. Pass API routes through to their respective granular route handlers with security headers
  if (pathname.startsWith("/api")) {
    const res = NextResponse.next();
    return applySecurityHeaders(res, { isApiRoute: true });
  }

  const decoded = await verifyToken(req);

  // 3. Universal /dashboard route: Smart Role-Based Dispatcher
  if (pathname === "/dashboard") {
    if (!decoded) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", "/dashboard");
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    const target =
      decoded.role === "ADMIN"
        ? "/admin"
        : "/author-dashboard?menu=Royalty%20Withdrawal";
    return applySecurityHeaders(NextResponse.redirect(new URL(target, req.url)));
  }

  // 4. Protected Admin Portal: RBAC Strict Enforcement
  if (pathname.startsWith("/admin")) {
    if (!decoded) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    if (decoded.role !== "ADMIN") {
      // Author attempted to access Admin dashboard -> Redirect to Author dashboard with notice
      const url = req.nextUrl.clone();
      url.pathname = "/author-dashboard";
      url.searchParams.set("menu", "Royalty Withdrawal");
      url.searchParams.set("access_denied", "admin_required");
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // 5. Protected Author Portal, Dashboard & Inbox: Authentication Enforcement
  if (
    pathname.startsWith("/author") ||
    pathname.startsWith("/author-dashboard") ||
    pathname.startsWith("/inbox")
  ) {
    if (!decoded) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      const fullRedirect = req.nextUrl.search
        ? `${pathname}${req.nextUrl.search}`
        : pathname;
      url.searchParams.set("redirect", fullRedirect);
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    if (decoded.role !== "AUTHOR") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // 6. Protected Book Creation: Requires authenticated Author session
  if (pathname.startsWith("/create_book")) {
    if (!decoded) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      const fullRedirect = req.nextUrl.search
        ? `${pathname}${req.nextUrl.search}`
        : pathname;
      url.searchParams.set("redirect", fullRedirect);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // 7. Login Page: If already authenticated, redirect to appropriate role dashboard
  if (pathname === "/login" && decoded) {
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/")) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL(redirectParam, req.url))
      );
    }
    const target =
      decoded.role === "ADMIN"
        ? "/admin"
        : "/author-dashboard?menu=Royalty%20Withdrawal";
    return applySecurityHeaders(NextResponse.redirect(new URL(target, req.url)));
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard",
    "/admin",
    "/admin/:path*",
    "/author",
    "/author/:path*",
    "/author-dashboard",
    "/author-dashboard/:path*",
    "/inbox",
    "/inbox/:path*",
    "/create_book",
    "/create_book/:path*",
    "/login",
  ],
};
