export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateMarketingCampaign, isGeminiConfigured } from "@/lib/gemini";
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
    if (!user) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Authentication required to use AI Marketing Suite" },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const body = sanitizeNoSql(rawBody);

    const bookTitle = body.bookTitle || body.title;
    if (!bookTitle) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Book title is required for marketing generation" },
          { status: 400 }
        ),
        { isApiRoute: true }
      );
    }

    const campaign = await generateMarketingCampaign({
      bookTitle,
      genre: body.genre || "Fiction",
      blurb: body.blurb || "",
    });

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          bookTitle,
          campaign,
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
          error: "Failed to generate marketing campaign",
          details: err?.message,
        },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
