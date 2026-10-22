export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { LoginInputSchema } from "@/types/domain";
import {
  createAuthTokens,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  toSafeUser,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/repository";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limiter";
import { registerSession, parseDeviceLabel } from "@/lib/session-store";
import { dispatchActivityEmail } from "@/lib/email";
import { applySecurityHeaders, sanitizeNoSql } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // 1. Multi-tier Distributed Rate Limiting (5 attempts/min brute-force defense)
    const { errorResponse, result } = await enforceRateLimit(req, "login");
    if (errorResponse) {
      return applySecurityHeaders(errorResponse, { isApiRoute: true });
    }

    const rawBody = await req.json().catch(() => null);
    const sanitizedBody = sanitizeNoSql(rawBody);
    const parsed = LoginInputSchema.safeParse(sanitizedBody);

    if (!parsed.success) {
      const resp = NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
      for (const [k, v] of Object.entries(result.headers)) {
        resp.headers.set(k, v);
      }
      return applySecurityHeaders(resp, { isApiRoute: true });
    }

    const userRecord = await findUserByEmail(parsed.data.email);
    if (!userRecord) {
      const resp = NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
      for (const [k, v] of Object.entries(result.headers)) {
        resp.headers.set(k, v);
      }
      return applySecurityHeaders(resp, { isApiRoute: true });
    }

    const isValidPassword = await verifyPassword(
      parsed.data.password,
      userRecord.password_hash
    );
    if (!isValidPassword) {
      const resp = NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
      for (const [k, v] of Object.entries(result.headers)) {
        resp.headers.set(k, v);
      }
      return applySecurityHeaders(resp, { isApiRoute: true });
    }

    const safeUser = toSafeUser(userRecord);
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    // 2. Register Tracked Active Session
    const activeSession = await registerSession({
      userId: safeUser.user_id,
      authorId: safeUser.author_id,
      email: safeUser.email,
      role: safeUser.role,
      ip,
      userAgent,
      ttlSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    // 3. Issue Dual Auth Tokens bonded to this Session ID
    const { accessToken, refreshToken, expiresIn } = await createAuthTokens(
      safeUser,
      activeSession.session_id
    );

    // 4. Send Login Activity Security Email via Nodemailer
    dispatchActivityEmail("LOGIN", {
      name: safeUser.name,
      email: safeUser.email,
      userId: safeUser.user_id,
      authorId: safeUser.author_id,
      ip,
      device: parseDeviceLabel(userAgent),
      timestamp: new Date().toISOString(),
    }).catch((err) => {
      console.warn("[BookLeaf Auth] Non-blocking email dispatch warning:", err);
    });

    const response = NextResponse.json(
      {
        success: true,
        user: safeUser,
        role: safeUser.role,
        sessionId: activeSession.session_id,
        accessToken,
        refreshToken,
        token: accessToken, // backward compatibility
        expiresIn,
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";

    // Attach RateLimit Headers
    for (const [k, v] of Object.entries(result.headers)) {
      response.headers.set(k, v);
    }

    // Set short-lived Access Token cookie (15m)
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    // Set long-lived Refresh Token cookie (7d)
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    // Set legacy session cookie for backwards compatibility (7d)
    response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    return applySecurityHeaders(response, { isApiRoute: true });
  } catch (err: any) {
    const errorResp = NextResponse.json(
      {
        success: false,
        error: "An unexpected authentication error occurred",
        details: err?.message,
      },
      { status: 500 }
    );
    return applySecurityHeaders(errorResp, { isApiRoute: true });
  }
}
