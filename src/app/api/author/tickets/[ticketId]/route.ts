import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAuthorTicketDetail } from "@/lib/repository";

export async function GET(
  _req: NextRequest,
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
    if (user.role !== "AUTHOR" || !user.author_id) {
      return NextResponse.json(
        { success: false, error: "Access denied. Author role required." },
        { status: 403 }
      );
    }

    const { ticketId } = await Promise.resolve(context.params);
    const result = await getAuthorTicketDetail(user.author_id, ticketId);

    if (result.status === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (result.status === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. You can only access your own support tickets.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: result.ticket,
      book: result.book,
      messages: result.messages,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load ticket details" },
      { status: 500 }
    );
  }
}
