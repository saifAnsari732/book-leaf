export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  createAuthTokens,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  toSafeUser,
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/repository";
import { getClientIp } from "@/lib/rate-limiter";
import { registerSession } from "@/lib/session-store";
import { applySecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const role = (body?.role || "AUTHOR").toUpperCase();
    const targetEmail =
      role === "ADMIN"
        ? (process.env.DEMO_ADMIN_EMAIL || "admin@bookleafpub.com")
        : (body?.email || "priya.sharma@email.com");

    const userRecord = await findUserByEmail(targetEmail);
    if (!userRecord) {
      return NextResponse.json(
        {
          success: false,
          error: `Demo user account [${targetEmail}] not found. Please run database seeding.`,
        },
        { status: 404 }
      );
    }

    const safeUser = toSafeUser(userRecord);
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Browser Client";

    // Register active session
    await registerSession({
      userId: safeUser.user_id,
      authorId: safeUser.author_id,
      email: safeUser.email,
      role: safeUser.role,
      ip,
      userAgent,
      ttlSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    const tokens = await createAuthTokens(safeUser);
    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: `Successfully authenticated as ${safeUser.name} (${safeUser.role})`,
      user: safeUser,
      role: safeUser.role,
      accessToken: tokens.accessToken,
    });

    // Set secure auth cookies
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    response.cookies.set(SESSION_COOKIE_NAME, tokens.accessToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    return applySecurityHeaders(response, { isApiRoute: true });
  } catch (error: any) {
    console.error("[Quick Login Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to establish quick demo session." },
      { status: 500 }
    );
  }
}
