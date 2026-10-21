import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getSessionUser } from "@/lib/auth";
import { AdminRegenerateDraftInputSchema } from "@/types/domain";
import {
  getAdminTicketDetail,
  updateTicketAIDraft,
} from "@/lib/repository";
import { analyzeTicketWithAI } from "@/lib/ai-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ticketId: string }> | { ticketId: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Administrator privileges required.",
        },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`ai-draft:${user.user_id}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "AI draft generation rate limit reached. Please wait a moment.",
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = AdminRegenerateDraftInputSchema.safeParse(body);
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

    const { ticketId } = await Promise.resolve(context.params);
    const detail = await getAdminTicketDetail(ticketId);
    if (!detail) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const authorObj = detail.author || {
      user_id: `USR-${detail.ticket.author_id}`,
      author_id: detail.ticket.author_id,
      name: detail.ticket.author_name,
      email: detail.ticket.author_email,
      role: "AUTHOR" as const,
      phone: null,
      city: null,
      joined_date: null,
    };

    const aiMetadata = await analyzeTicketWithAI({
      subject: detail.ticket.subject,
      description: detail.ticket.description,
      author: authorObj,
      selectedBook: detail.book,
      allAuthorBooks: detail.authorAllBooks,
      customInstruction: parsed.data.custom_instruction,
    });

    const updatedTicket = await updateTicketAIDraft({
      ticketId,
      admin: user,
      aiMetadata,
    });

    return NextResponse.json({
      success: true,
      ai_metadata: updatedTicket?.ai_metadata || aiMetadata,
      ticket: updatedTicket,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate AI draft reply" },
      { status: 500 }
    );
  }
}
