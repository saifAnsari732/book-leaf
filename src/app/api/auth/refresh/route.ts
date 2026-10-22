export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  createAuthTokens,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  toSafeUser,
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract refresh token from cookie or body
    const cookieToken = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    const body = await req.json().catch(() => ({}));
    const refreshToken = cookieToken || body?.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Refresh token is missing",
        },
        { status: 401 }
      );
    }

    // 2. Verify refresh token signature & expiration
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Refresh token is expired or invalid. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // 3. Find user in repository to ensure active account
    const userRecord = await findUserByEmail(payload.email);
    if (!userRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const safeUser = toSafeUser(userRecord);

    // 4. Issue a new Access Token & rotated Refresh Token
    const tokens = await createAuthTokens(safeUser);

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json(
      {
        success: true,
        user: safeUser,
        role: safeUser.role,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        token: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      { status: 200 }
    );

    // 5. Update cookies
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

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh authentication token",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
