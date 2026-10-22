export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getBooksByAuthorId } from "@/lib/repository";
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
          error: "Access denied. Only authors can view their personal catalog.",
        },
        { status: 403 }
      );
    }

    const cacheKey = REDIS_KEYS.authorBooks(user.author_id);
    const cached = await redisGet<unknown[]>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        author_id: user.author_id,
        count: cached.length,
        books: cached,
        cached: true,
      });
    }

    const books = await getBooksByAuthorId(user.author_id);
    await redisSet(cacheKey, books, 120); // 2 mins TTL

    return NextResponse.json({
      success: true,
      author_id: user.author_id,
      count: books.length,
      books,
      cached: false,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve author books" },
      { status: 500 }
    );
  }
}

