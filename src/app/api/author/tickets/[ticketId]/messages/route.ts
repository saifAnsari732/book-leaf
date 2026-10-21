import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { AuthorReplyInputSchema } from "@/types/domain";
import { addAuthorMessageToTicket } from "@/lib/repository";

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
    if (user.role !== "AUTHOR" || !user.author_id) {
      return NextResponse.json(
        { success: false, error: "Access denied. Author role required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = AuthorReplyInputSchema.safeParse(body);
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
    const result = await addAuthorMessageToTicket({
      author: user,
      ticketId,
      content: parsed.data.content,
      attachments: parsed.data.attachments,
    });

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
          error: "Access denied. You cannot post messages to another author's ticket.",
        },
        { status: 403 }
      );
    }
    if (result.status === "CLOSED") {
      return NextResponse.json(
        {
          success: false,
          error: "This ticket is closed. Please open a new support ticket if you need further assistance.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to post message" },
      { status: 500 }
    );
  }
}
