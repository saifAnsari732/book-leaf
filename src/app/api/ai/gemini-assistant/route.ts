export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini, isGeminiConfigured } from "@/lib/gemini";
import { getSessionUser, checkRateLimit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";

    // Rate Limiting Protection: Max 20 Gemini requests per minute per IP
    const rateCheck = checkRateLimit(`gemini-ai:${ip}`, 20, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many AI assistant requests. Please wait a moment before sending another message.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const user = await getSessionUser();
    const body = await req.json().catch(() => ({}));
    const { prompt, history = [], customInstruction } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt text is required" },
        { status: 400 }
      );
    }

    // Input Sanitization: Clamp prompt length to 2000 characters to prevent token exhaustion
    const sanitizedPrompt = prompt.trim().slice(0, 2000);

    const systemInstruction = `You are Nishtha, the Senior AI Publishing Concierge at BookLeaf Publishing (Shark Tank India Season 4 featured).
Your tone is warm, professional, encouraging, and deeply knowledgeable about publishing, book design, royalties, Amazon/Flipkart distribution, and copyright.
Always provide concrete, actionable answers. Mention official BookLeaf policies (80/20 & 100% royalty models, ₹1,000 withdrawal threshold, 14-day turnaround).
User Name: ${user?.name || "Author"}
User Role: ${user?.role || "GUEST"}
${customInstruction && typeof customInstruction === "string" ? `\nAdditional context: ${customInstruction.slice(0, 500)}` : ""}`;

    // Combine history for multi-turn chat (sanitized & limited to last 8 turns)
    let fullPrompt = sanitizedPrompt;
    if (Array.isArray(history) && history.length > 0) {
      const sanitizedHistory = history.slice(-8).map((h: any) => ({
        role: h.role === "user" ? "Author" : "Nishtha",
        content: typeof h.content === "string" ? h.content.slice(0, 1000) : "",
      }));

      const historyContext = sanitizedHistory
        .map((h: any) => `${h.role}: ${h.content}`)
        .join("\n");
      fullPrompt = `Previous Conversation:\n${historyContext}\n\nCurrent Question: ${sanitizedPrompt}`;
    }

    const aiResponse = await generateWithGemini(fullPrompt, {
      systemInstruction,
      temperature: 0.5,
    });

    return NextResponse.json(
      {
        success: true,
        response: aiResponse,
        provider: isGeminiConfigured() ? "gemini-api" : "gemini-grounded-engine",
        model: "gemini-2.5-flash",
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
