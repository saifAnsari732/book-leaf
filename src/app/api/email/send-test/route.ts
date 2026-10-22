export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { dispatchActivityEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limiter";
import { applySecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest) {
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

    // Rate limit test email generation (10/min)
    const { errorResponse } = await enforceRateLimit(
      req,
      "email",
      user.user_id
    );
    if (errorResponse) {
      return applySecurityHeaders(errorResponse, { isApiRoute: true });
    }

    const body = await req.json().catch(() => ({}));
    const type = (body.type || "LOGIN").toUpperCase();

    let emailRecord;

    switch (type) {
      case "PAYMENT": {
        const amount = body.amount || 2499;
        const planName = body.planName || "Bestseller Global Publishing Package";
        emailRecord = await dispatchActivityEmail("PAYMENT", {
          name: user.name,
          email: user.email,
          userId: user.user_id,
          authorId: user.author_id,
          amount,
          orderId: `order_test_${Date.now()}`,
          paymentId: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
          itemDescription: planName,
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "TICKET": {
        emailRecord = await dispatchActivityEmail("TICKET", {
          name: user.name,
          email: user.email,
          userId: user.user_id,
          authorId: user.author_id,
          ticketId: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
          subject: body.subject || "Query regarding ISBN allotment & Amazon listing",
          status: "In Progress",
          priority: "High",
          messagePreview:
            "Our editorial team has verified the metadata and forwarded the proof copy to the Bangalore print unit.",
          actorName: "Support Team Lead",
          actorRole: "Admin",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "BOOK": {
        emailRecord = await dispatchActivityEmail("BOOK", {
          name: user.name,
          email: user.email,
          userId: user.user_id,
          authorId: user.author_id,
          bookTitle: body.bookTitle || "The Echoes of Varanasi",
          isbn: "978-93-91234-99-9",
          genre: "Literary Fiction",
          status: "In-Production",
          royaltyPerCopy: 140,
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "SECURITY": {
        emailRecord = await dispatchActivityEmail("SECURITY", {
          name: user.name,
          email: user.email,
          userId: user.user_id,
          authorId: user.author_id,
          eventType: "Password Changed & Active Sessions Refreshed",
          details: "Your account credentials were successfully updated via BookLeaf Security Portal.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "LOGIN":
      default: {
        emailRecord = await dispatchActivityEmail("LOGIN", {
          name: user.name,
          email: user.email,
          userId: user.user_id,
          authorId: user.author_id,
          ip: "103.21.244.18",
          device: "Chrome 122 on Windows 11",
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          message: `Successfully generated and sent ${type} email via Nodemailer!`,
          email: emailRecord,
        },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: err?.message || "Failed to send test email" },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
