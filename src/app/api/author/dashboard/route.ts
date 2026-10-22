import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAuthorTickets, getBooksByAuthorId } from "@/lib/repository";
import { redisGet, redisSet, REDIS_KEYS } from "@/lib/redis";

export async function GET() {
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
        {
          success: false,
          error: "Access denied. Author portal requires an AUTHOR role.",
        },
        { status: 403 }
      );
    }

    const cacheKey = REDIS_KEYS.authorDashboard(user.author_id);
    const cached = await redisGet<Record<string, unknown>>(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    const [books, tickets] = await Promise.all([
      getBooksByAuthorId(user.author_id),
      getAuthorTickets(user.author_id),
    ]);

    const publishedBooks = books.filter(
      (b) => !b.status.toLowerCase().includes("in production")
    ).length;
    const booksInProduction = books.length - publishedBooks;
    const totalCopiesSold = books.reduce(
      (sum, b) => sum + (b.total_copies_sold || 0),
      0
    );
    const totalRoyaltyEarned = books.reduce(
      (sum, b) => sum + (b.total_royalty_earned || 0),
      0
    );
    const totalRoyaltyPaid = books.reduce(
      (sum, b) => sum + (b.royalty_paid || 0),
      0
    );
    const totalRoyaltyPending = books.reduce(
      (sum, b) => sum + (b.royalty_pending || 0),
      0
    );

    const openTicketsCount = tickets.filter(
      (t) => t.status === "Open" || t.status === "In Progress"
    ).length;

    const payload = {
      success: true,
      author: user,
      metrics: {
        totalBooks: books.length,
        publishedBooks,
        booksInProduction,
        totalCopiesSold,
        totalRoyaltyEarned,
        totalRoyaltyPaid,
        totalRoyaltyPending,
        totalTickets: tickets.length,
        openTicketsCount,
      },
      books,
      recentTickets: tickets.slice(0, 5),
    };

    await redisSet(cacheKey, payload, 30); // 30s TTL

    return NextResponse.json({
      ...payload,
      cached: false,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load author dashboard" },
      { status: 500 }
    );
  }
}

