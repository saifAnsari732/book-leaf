export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAuthorTicketDetail } from "@/lib/repository";
import { redisGet, redisSet, REDIS_KEYS } from "@/lib/redis";

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

    // Fast Tiered Cache lookup
    const cacheKey = `bl:author:${user.author_id}:ticket:${ticketId}:v1`;
    const cached = await redisGet<Record<string, unknown>>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached,
        fromCache: true,
        serverTimestamp: new Date().toISOString(),
      });
    }

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

    const payload = {
      ticket: result.ticket,
      book: result.book,
      messages: result.messages,
    };

    // Cache in Tiered L1 + L2 for 20s
    await redisSet(cacheKey, payload, 20);

    return NextResponse.json({
      success: true,
      ...payload,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load ticket details" },
      { status: 500 }
    );
  }
}
