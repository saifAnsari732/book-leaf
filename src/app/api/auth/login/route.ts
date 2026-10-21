import { NextRequest, NextResponse } from "next/server";
import { LoginInputSchema } from "@/types/domain";
import {
  checkRateLimit,
  createSessionToken,
  SESSION_COOKIE_NAME,
  toSafeUser,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";
    const limit = checkRateLimit(`login:${ip}`, 15, 60_000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts. Please try again shortly.",
          retryAfterSeconds: limit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = LoginInputSchema.safeParse(body);

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

    const userRecord = await findUserByEmail(parsed.data.email);
    if (!userRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(
      parsed.data.password,
      userRecord.password_hash
    );
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const safeUser = toSafeUser(userRecord);
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json(
      {
        success: true,
        user: safeUser,
        token,
      },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected authentication error occurred",
      },
      { status: 500 }
    );
  }
}
