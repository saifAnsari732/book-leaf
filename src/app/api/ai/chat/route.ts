export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini, isGeminiConfigured } from "@/lib/gemini";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limiter";
import { applySecurityHeaders, sanitizeNoSql } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = await enforceRateLimit(req, "ai");
    if (errorResponse) {
      return applySecurityHeaders(errorResponse, { isApiRoute: true });
    }

    const user = await getCurrentUserFromRequest(req);
    const rawBody = await req.json().catch(() => ({}));
    const body = sanitizeNoSql(rawBody);

    const message = (body.message || body.prompt || "").toString().trim().slice(0, 2000);
    if (!message) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Message or prompt is required" },
          { status: 400 }
        ),
        { isApiRoute: true }
      );
    }

    const history = Array.isArray(body.history) ? body.history : [];
    const context = body.context || {};

    const systemInstruction = `You are Nishtha, the Senior AI Publishing Concierge at BookLeaf Publishing (Shark Tank India Season 4 featured).
Your tone is warm, professional, encouraging, and deeply knowledgeable about publishing, book design, royalties, Amazon/Flipkart distribution, and copyright.
Always provide concrete, actionable answers. Mention official BookLeaf policies (80/20 & 100% royalty models, ₹1,000 withdrawal threshold, 14-day turnaround).
User Name: ${context.authorName || user?.name || "Author"}
User Role: ${user?.role || "AUTHOR"}
Active Books Count: ${context.booksCount ?? "1"}`;

    let fullPrompt = message;
    if (history.length > 0) {
      const historyContext = history
        .slice(-6)
        .map((h: any) => `${h.sender === "user" || h.role === "user" ? "Author" : "Nishtha"}: ${h.text || h.content || ""}`)
        .join("\n");
      fullPrompt = `Previous Conversation:\n${historyContext}\n\nCurrent Question: ${message}`;
    }

    const aiResponse = await generateWithGemini(fullPrompt, {
      systemInstruction,
      temperature: 0.5,
    });

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          reply: aiResponse,
          response: aiResponse,
          provider: isGeminiConfigured() ? "Google Gemini Live API" : "BookLeaf AI Grounded Engine",
          model: "gemini-2.5-flash",
          generatedAt: new Date().toISOString(),
        },
        { status: 200 }
      ),
      { isApiRoute: true }
    );
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Failed to generate AI chat response",
          details: err?.message,
        },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
