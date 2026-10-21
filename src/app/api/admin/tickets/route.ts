import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { queryAdminTickets } from "@/lib/repository";

export async function GET(req: NextRequest) {
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

    const sp = req.nextUrl.searchParams;
    const sortParam = sp.get("sortBy");
    const sortBy =
      sortParam === "newest" || sortParam === "oldest" ? sortParam : "urgent";

    const result = await queryAdminTickets({
      search: sp.get("search") || undefined,
      status: sp.get("status") || undefined,
      category: sp.get("category") || undefined,
      priority: sp.get("priority") || undefined,
      assignee: sp.get("assignee") || undefined,
      dateFrom: sp.get("dateFrom") || undefined,
      dateTo: sp.get("dateTo") || undefined,
      sortBy,
      page: Number(sp.get("page")) || 1,
      limit: Number(sp.get("limit")) || 12,
    });

    return NextResponse.json({
      success: true,
      ...result,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to query admin ticket queue" },
      { status: 500 }
    );
  }
}
