export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createNewBookForAuthor } from "@/lib/repository";
import { dispatchActivityEmail } from "@/lib/email";
import { applySecurityHeaders } from "@/lib/security";
import { invalidateAuthorCaches } from "@/lib/redis";
import { z } from "zod";

const CreateBookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(180),
  subtitle: z.string().max(200).optional(),
  author_name: z.string().min(2, "Author name is required"),
  language: z.string().default("English"),
  genre: z.string().default("General Fiction"),
  trim_size: z.string().default("5x8 inches"),
  binding: z.enum(["Paperback", "Hardcover", "Both"]).default("Paperback"),
  manuscript_url: z.string().optional(),
  blurb: z.string().max(2000).optional(),
  target_mrp: z.number().min(99).max(9999).default(399),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "AUTHOR" || !user.author_id) {
      return NextResponse.json(
        { success: false, error: "Only authors can create books" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateBookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const newBook = await createNewBookForAuthor(
      user.author_id,
      user.name,
      parsed.data
    );

    // Send Book Publishing Milestone Email via Nodemailer
    dispatchActivityEmail("BOOK", {
      name: user.name,
      email: user.email,
      userId: user.user_id,
      authorId: user.author_id,
      bookTitle: newBook.title,
      isbn: newBook.isbn,
      genre: newBook.genre,
      status: newBook.status,
      royaltyPerCopy: newBook.author_royalty_per_copy,
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    // Invalidate author caches for instant book catalog refresh
    await invalidateAuthorCaches(user.author_id);

    const response = NextResponse.json(
      {
        success: true,
        book: newBook,
        message: `Congratulations! "${newBook.title}" has been created and submitted to BookLeaf's editorial review queue.`,
      },
      { status: 201 }
    );

    return applySecurityHeaders(response, { isApiRoute: true });
  } catch (error) {
    console.error("[API Create Book POST] Error:", error);
    const errResponse = NextResponse.json(
      { success: false, error: "Failed to create new book" },
      { status: 500 }
    );
    return applySecurityHeaders(errResponse, { isApiRoute: true });
  }
}
