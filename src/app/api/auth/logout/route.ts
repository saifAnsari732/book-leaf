export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  getCurrentUserFromRequest,
  verifyRefreshToken,
} from "@/lib/auth";
import { revokeSession } from "@/lib/session-store";
import { applySecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    const refreshCookie = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    if (refreshCookie) {
      const decodedRefresh = await verifyRefreshToken(refreshCookie);
      if (decodedRefresh?.sid) {
        await revokeSession(decodedRefresh.sid, decodedRefresh.user_id);
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully. Active session revoked.",
      },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    };

    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", cookieOptions);
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", cookieOptions);
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...cookieOptions,
      httpOnly: false,
    });
    // Also explicitly expire with httpOnly: true just in case
    response.cookies.set(SESSION_COOKIE_NAME, "", cookieOptions);

    return applySecurityHeaders(response, { isApiRoute: true });
  } catch (err: any) {
    const response = NextResponse.json(
      {
        success: false,
        error: "Failed to process logout",
        details: err?.message,
      },
      { status: 500 }
    );
    return applySecurityHeaders(response, { isApiRoute: true });
  }
}
