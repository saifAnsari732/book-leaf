import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { AdminUpdateTicketInputSchema } from "@/types/domain";
import {
  getAdminTicketDetail,
  updateTicketByAdmin,
} from "@/lib/repository";

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
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Administrator privileges required.",
        },
        { status: 403 }
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

    return NextResponse.json({
      success: true,
      ...detail,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load admin ticket detail" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const parsed = AdminUpdateTicketInputSchema.safeParse(body);
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
    const updated = await updateTicketByAdmin({
      ticketId,
      admin: user,
      updates: parsed.data,
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
      { success: false, error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
