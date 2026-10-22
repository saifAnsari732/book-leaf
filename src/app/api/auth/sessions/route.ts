export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUserFromRequest,
  REFRESH_TOKEN_COOKIE_NAME,
  verifyRefreshToken,
} from "@/lib/auth";
import {
  getUserActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
} from "@/lib/session-store";
import { dispatchActivityEmail } from "@/lib/email";
import { applySecurityHeaders } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    const refreshCookie = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    let currentSessionId: string | undefined;
    if (refreshCookie) {
      const decoded = await verifyRefreshToken(refreshCookie);
      currentSessionId = decoded?.sid;
    }

    const sessions = await getUserActiveSessions(
      user.user_id,
      currentSessionId
    );

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          sessions,
          total: sessions.length,
          currentSessionId,
        },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to list sessions" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const revokeAllOthers = searchParams.get("all_others") === "true";

    const refreshCookie = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    let currentSessionId: string | undefined;
    if (refreshCookie) {
      const decoded = await verifyRefreshToken(refreshCookie);
      currentSessionId = decoded?.sid;
    }

    if (revokeAllOthers) {
      const revokedCount = await revokeAllOtherSessions(
        user.user_id,
        currentSessionId
      );

      // Send security alert email
      dispatchActivityEmail("SECURITY", {
        name: user.name,
        email: user.email,
        userId: user.user_id,
        authorId: user.author_id,
        eventType: "All Other Active Sessions Terminated",
        details: `${revokedCount} other active browser session(s) were revoked.`,
        timestamp: new Date().toISOString(),
      }).catch(() => {});

      return applySecurityHeaders(
        NextResponse.json(
          {
            success: true,
            message: `Successfully revoked ${revokedCount} other session(s).`,
            revokedCount,
          },
          { status: 200 }
        ),
        { isApiRoute: true }
      );
    }

    if (!sessionId) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Missing sessionId parameter" },
          { status: 400 }
        ),
        { isApiRoute: true }
      );
    }

    const success = await revokeSession(sessionId, user.user_id);
    if (!success) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Session not found or already revoked" },
          { status: 404 }
        ),
        { isApiRoute: true }
      );
    }

    dispatchActivityEmail("SECURITY", {
      name: user.name,
      email: user.email,
      userId: user.user_id,
      authorId: user.author_id,
      eventType: "Specific Session Revoked",
      details: `Session ID '${sessionId}' was manually terminated.`,
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          message: "Session revoked successfully",
          sessionId,
        },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to revoke session" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
