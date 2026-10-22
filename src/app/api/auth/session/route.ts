export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  verifyRefreshToken,
  createAuthTokens,
  toSafeUser,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/repository";
import { applySecurityHeaders } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    // 1. Try resolving session user via current Access Token or Authorization header
    let user = await getSessionUser();

    // 2. If access token is expired or absent, check if a valid refresh token exists
    if (!user) {
      const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
      if (refreshToken) {
        const payload = await verifyRefreshToken(refreshToken);
        if (payload) {
          const userRecord = await findUserByEmail(payload.email);
          if (userRecord) {
            user = toSafeUser(userRecord);

            // Auto-refresh access token on the fly
            const tokens = await createAuthTokens(user);
            const isProd = process.env.NODE_ENV === "production";

            const response = NextResponse.json(
              {
                success: true,
                authenticated: true,
                user,
                role: user.role,
                autoRefreshed: true,
                accessToken: tokens.accessToken,
                expiresIn: tokens.expiresIn,
              },
              { status: 200 }
            );

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
              httpOnly: true,
              sameSite: "lax",
              secure: isProd,
              path: "/",
              maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
            });

            return applySecurityHeaders(response, { isApiRoute: true });
          }
        }
      }
    }

    if (!user) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            success: false,
            authenticated: false,
            user: null,
            role: null,
          },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          authenticated: true,
          user,
          role: user.role,
        },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
          role: null,
          error: "Failed to resolve session",
          details: err?.message,
        },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
