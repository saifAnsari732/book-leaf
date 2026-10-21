import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getBooksByAuthorId } from "@/lib/repository";

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

    const books = await getBooksByAuthorId(user.author_id);

    return NextResponse.json({
      success: true,
      author_id: user.author_id,
      count: books.length,
      books,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve author books" },
      { status: 500 }
    );
  }
}
