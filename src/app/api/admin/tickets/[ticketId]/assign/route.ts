export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateTicketByAdmin } from "@/lib/repository";

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

    const body = await req.json().catch(() => ({}));
    const assignee =
      body && typeof body.assigned_to === "string"
        ? body.assigned_to.trim() || null
        : body && body.assigned_to === null
        ? null
        : user.name;

    const { ticketId } = await Promise.resolve(context.params);
    const updated = await updateTicketByAdmin({
      ticketId,
      admin: user,
      updates: { assigned_to: assignee },
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to assign ticket" },
      { status: 500 }
    );
  }
}
