export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateBookWritingContent, isGeminiConfigured } from "@/lib/gemini";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limiter";
import { applySecurityHeaders, sanitizeNoSql } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce AI rate limiting (20 req/min)
    const { errorResponse } = await enforceRateLimit(req, "ai");
    if (errorResponse) {
      return applySecurityHeaders(errorResponse, { isApiRoute: true });
    }

    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Authentication required to use AI Writing Studio" },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const body = sanitizeNoSql(rawBody);

    const action = body.action || "chapter";
    if (!["chapter", "blurb", "titles", "outline", "proofread"].includes(action)) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: `Invalid action '${action}'. Allowed: chapter, blurb, titles, outline, proofread.` },
          { status: 400 }
        ),
        { isApiRoute: true }
      );
    }

    const content = await generateBookWritingContent({
      action,
      title: body.title,
      genre: body.genre,
      topic: body.topic,
      draftText: body.draftText,
      tone: body.tone,
    });

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          action,
          content,
          model: "gemini-3.8-flash",
          provider: isGeminiConfigured() ? "Google Gemini Live API" : "BookLeaf AI Grounded Engine",
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
          error: "Failed to generate book writing content",
          details: err?.message,
        },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
