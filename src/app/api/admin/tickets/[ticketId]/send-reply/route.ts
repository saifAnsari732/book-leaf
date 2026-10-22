export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { AdminSendReplyInputSchema } from "@/types/domain";
import { sendAdminReplyToTicket } from "@/lib/repository";
import { invalidateTicketCaches } from "@/lib/redis";

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

    const body = await req.json().catch(() => null);
    const parsed = AdminSendReplyInputSchema.safeParse(body);
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
    const result = await sendAdminReplyToTicket({
      ticketId,
      admin: user,
      content: parsed.data.content,
      newStatus: parsed.data.status ?? parsed.data.new_status,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    await invalidateTicketCaches({
      ticketId,
      authorId: result.ticket.author_id,
    });

    return NextResponse.json(
      {
        success: true,
        ticket: result.ticket,
        message: result.message,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to send response to author" },
      { status: 500 }
    );
  }
}
