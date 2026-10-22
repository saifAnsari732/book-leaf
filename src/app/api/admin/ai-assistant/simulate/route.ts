export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { analyzeTicketWithAI } from "@/lib/ai-service";
import {
  getSlicedKnowledgeBaseContext,
  buildBookDiagnostics,
} from "@/lib/knowledge-base";
import {
  getBookByIdAdmin,
  findUserByAuthorId,
  getBooksByAuthorId,
} from "@/lib/repository";
import { BookRecord, SafeUser } from "@/types/domain";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      author_id = "AUTH001",
      book_id = null,
      subject = "Royalty inquiry",
      description = "My royalties are overdue. Please check.",
      tone = "Empathetic",
    } = body;

    const userRecord = await findUserByAuthorId(author_id);
    const author: SafeUser = userRecord
      ? {
          user_id: userRecord.user_id,
          author_id: userRecord.author_id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          phone: userRecord.phone,
          city: userRecord.city,
          joined_date: userRecord.joined_date,
        }
      : session;

    const selectedBook: BookRecord | null = book_id
      ? await getBookByIdAdmin(book_id)
      : null;
    const allAuthorBooks: BookRecord[] = author.author_id
      ? await getBooksByAuthorId(author.author_id)
      : [];

    const startTime = Date.now();
    const customInstruction = `Adopt a ${tone.toLowerCase()} tone. BookLeaf official policy grounding strictly required.`;

    const aiResult = await analyzeTicketWithAI({
      subject,
      description,
      author,
      selectedBook,
      allAuthorBooks,
      customInstruction,
    });

    const latencyMs = Date.now() - startTime;
    const slicedContext = getSlicedKnowledgeBaseContext(
      aiResult.suggested_category
    );
    const diagnostics = buildBookDiagnostics(
      author,
      selectedBook,
      allAuthorBooks
    );

    return NextResponse.json({
      success: true,
      latencyMs,
      result: aiResult,
      slicedPolicy: slicedContext.slicedContext,
      diagnostics,
    });
  } catch (error) {
    console.error("[API AI Simulate Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI simulation failed",
      },
      { status: 500 }
    );
  }
}
