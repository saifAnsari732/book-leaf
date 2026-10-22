export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { AdminNoteInputSchema } from "@/types/domain";
import { addInternalNoteByAdmin } from "@/lib/repository";

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
          error: "Access denied. Only administrators can add internal notes.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = AdminNoteInputSchema.safeParse(body);
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
    const note = await addInternalNoteByAdmin({
      ticketId,
      admin: user,
      content: parsed.data.content,
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        note,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save internal note" },
      { status: 500 }
    );
  }
}
