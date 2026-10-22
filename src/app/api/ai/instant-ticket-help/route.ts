export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateInstantTicketSolution, isGeminiConfigured } from "@/lib/gemini";
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
          { success: false, error: "Authentication required" },
          { status: 401 }
        ),
        { isApiRoute: true }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const body = sanitizeNoSql(rawBody);

    if (!body.subject && !body.description) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Subject or description is required" },
          { status: 400 }
        ),
        { isApiRoute: true }
      );
    }

    const solution = await generateInstantTicketSolution({
      subject: body.subject || "Support Query",
      description: body.description || "",
      category: body.category || "General Inquiry",
    });

    return applySecurityHeaders(
      NextResponse.json(
        {
          success: true,
          solution,
          model: "gemini-3.8-flash",
          provider: isGeminiConfigured() ? "Google Gemini Live API" : "BookLeaf AI Grounded Engine",
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
          error: "Failed to generate instant solution",
          details: err?.message,
        },
        { status: 500 }
      ),
      { isApiRoute: true }
    );
  }
}
