import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getSessionUser } from "@/lib/auth";
import { CreateTicketInputSchema } from "@/types/domain";
import {
  createAuthorTicket,
  getAuthorTickets,
  getBookByIdForAuthor,
  getBooksByAuthorId,
} from "@/lib/repository";
import { analyzeTicketWithAI } from "@/lib/ai-service";

export async function GET(req: NextRequest) {
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
          error: "Access denied. Only authors can view author tickets.",
        },
        { status: 403 }
      );
    }

    const statusFilter =
      req.nextUrl.searchParams.get("status") || "ALL";
    const tickets = await getAuthorTickets(user.author_id, statusFilter);

    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
      serverTimestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load author tickets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
          error: "Access denied. Only authors can submit support tickets.",
        },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`create-ticket:${user.user_id}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many ticket submissions. Please wait before submitting again.",
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = CreateTicketInputSchema.safeParse(body);
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

    const { book_id, subject, description, attachments } = parsed.data;
    const allAuthorBooks = await getBooksByAuthorId(user.author_id);

    let selectedBook = null;
    if (book_id) {
      selectedBook = await getBookByIdForAuthor(user.author_id, book_id);
      if (!selectedBook) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid book selection. You can only select books registered to your author account.",
          },
          { status: 403 }
        );
      }
    }

    // AI Classification, Priority Scoring & Draft Generation (never blocks ticket creation on AI error)
    const aiMetadata = await analyzeTicketWithAI({
      subject,
      description,
      author: user,
      selectedBook,
      allAuthorBooks,
    });

    const createdTicket = await createAuthorTicket({
      author: user,
      book: selectedBook,
      subject,
      description,
      attachments,
      aiMetadata,
    });

    // Strip internal AI draft reply before returning to author
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ai_metadata, ...publicTicket } = createdTicket;

    return NextResponse.json(
      {
        success: true,
        ticket: publicTicket,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
