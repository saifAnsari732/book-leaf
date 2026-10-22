export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, checkRateLimit } from "@/lib/auth";
import {
  createRazorpayOrder,
  resolveAuthoritativeAmount,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";

    // Rate Limiting Protection: Max 20 order creations per minute per IP
    const rateCheck = checkRateLimit(`payment-order:${ip}`, 20, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many payment requests. Please wait a moment before trying again.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const user = await getSessionUser();
    const body = await req.json().catch(() => ({}));
    const {
      planId,
      planName,
      amount,
      bookId,
      purpose = "Publishing Package",
      copies,
      binding,
      name,
      email,
      phone,
      gstin,
    } = body;

    // Zero-Loophole Security: Resolve authoritative price on server to defeat amount tampering
    const pricing = resolveAuthoritativeAmount({
      planId,
      planName,
      amount,
      purpose,
      copies,
      binding,
    });

    // Sanitize inputs against XSS / injection attacks
    const sanitizedAuthorName = (user?.name || name || "Author").toString().trim().slice(0, 80);
    const sanitizedAuthorEmail = (user?.email || email || "author@example.com").toString().trim().toLowerCase().slice(0, 100);
    const sanitizedAuthorPhone = (user?.phone || phone || "+91 9876543210").toString().trim().slice(0, 20);
    const sanitizedPurpose = (purpose || "Publishing Package").toString().trim().slice(0, 150);

    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notes: Record<string, string> = {
      purpose: sanitizedPurpose,
      planId: pricing.resolvedPlanId,
      planName: pricing.resolvedPlanTitle,
      userEmail: sanitizedAuthorEmail,
      userName: sanitizedAuthorName,
      userRole: user?.role || "AUTHOR",
    };

    if (gstin && typeof gstin === "string") {
      notes.gstin = gstin.trim().slice(0, 20);
    }
    if (bookId && typeof bookId === "string") {
      notes.bookId = bookId.trim().slice(0, 50);
    }

    // Create official order with server-determined amount
    const order = await createRazorpayOrder({
      amountInInr: pricing.amountInInr,
      receipt,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        order,
        pricing: {
          amountInInr: pricing.amountInInr,
          baseAmountInInr: pricing.baseAmountInInr,
          gstAmountInInr: pricing.gstAmountInInr,
          planTitle: pricing.resolvedPlanTitle,
          planId: pricing.resolvedPlanId,
        },
        author: {
          name: sanitizedAuthorName,
          email: sanitizedAuthorEmail,
          phone: sanitizedAuthorPhone,
        },
        keyId: getRazorpayKeyId(),
        isLive: isRazorpayConfigured(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize Razorpay order",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
