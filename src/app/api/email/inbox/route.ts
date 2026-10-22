export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getEmailHistory } from "@/lib/email";
import { applySecurityHeaders } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || undefined;

    // Authors see their own emails, Admins can view all emails or their own
    const emails = await getEmailHistory({
      userId: user.role === "ADMIN" ? undefined : user.user_id,
      category,
      search,
    });

    const unreadCount = emails.filter((em) => !em.read_at).length;

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          emails,
          count: emails.length,
          unreadCount,
        },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to load emails" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
