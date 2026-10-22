export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { RegisterInputSchema } from "@/types/domain";
import {
  checkRateLimit,
  createAuthTokens,
  hashPassword,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  toSafeUser,
} from "@/lib/auth";
import { findUserByEmail, registerAuthorUser } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";
    const limit = checkRateLimit(`register:${ip}`, 10, 60_000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many registration attempts. Please try again shortly.",
          retryAfterSeconds: limit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = RegisterInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
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
    }

    const { name, email, password, phone, city } = parsed.data;

    // Check if email is already registered
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);

    // Create author user
    const newUser = await registerAuthorUser({
      name,
      email,
      password_hash: passwordHash,
      phone: phone || null,
      city: city || null,
    });

    const safeUser = toSafeUser(newUser);
    const { accessToken, refreshToken, expiresIn } = await createAuthTokens(
      safeUser
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Author account registered successfully.",
        user: safeUser,
        role: safeUser.role,
        accessToken,
        refreshToken,
        token: accessToken,
        expiresIn,
      },
      { status: 201 }
    );

    const isProd = process.env.NODE_ENV === "production";

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

    // Set session cookie for backwards compatibility (7d)
    response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
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
        error: "An unexpected registration error occurred",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
