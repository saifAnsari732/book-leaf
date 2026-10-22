import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createNewBookForAuthor } from "@/lib/repository";
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

    return NextResponse.json({
      success: true,
      book: newBook,
      message: `Congratulations! "${newBook.title}" has been created and submitted to BookLeaf's editorial review queue.`,
    });
  } catch (error) {
    console.error("[API Create Book POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create new book" },
      { status: 500 }
    );
  }
}
