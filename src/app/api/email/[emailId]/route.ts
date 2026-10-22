export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getEmailById, markEmailAsRead, deleteEmail } from "@/lib/email";
import { applySecurityHeaders } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: { emailId: string } }
) {
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

    const email = getEmailById(params.emailId);
    if (!email) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Email not found" },
          { status: 404 }
        ),
        { isApiRoute: true }
      );
    }

    if (user.role !== "ADMIN" && email.user_id && email.user_id !== user.user_id) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Access denied" }, { status: 403 }),
        { isApiRoute: true }
      );
    }

    return applySecurityHeaders(
      NextResponse.json({ success: true, email }, { status: 200 }),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to load email" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { emailId: string } }
) {
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

    const email = getEmailById(params.emailId);
    if (!email) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Email not found" },
          { status: 404 }
        ),
        { isApiRoute: true }
      );
    }

    if (user.role !== "ADMIN" && email.user_id && email.user_id !== user.user_id) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Access denied" }, { status: 403 }),
        { isApiRoute: true }
      );
    }

    markEmailAsRead(params.emailId);

    return applySecurityHeaders(
      NextResponse.json(
        { success: true, message: "Marked as read", emailId: params.emailId },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to update email" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { emailId: string } }
) {
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

    const email = getEmailById(params.emailId);
    if (!email) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Email not found" },
          { status: 404 }
        ),
        { isApiRoute: true }
      );
    }

    if (user.role !== "ADMIN" && email.user_id && email.user_id !== user.user_id) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Access denied" }, { status: 403 }),
        { isApiRoute: true }
      );
    }

    deleteEmail(params.emailId);

    return applySecurityHeaders(
      NextResponse.json(
        { success: true, message: "Email deleted successfully" },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to delete email" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
