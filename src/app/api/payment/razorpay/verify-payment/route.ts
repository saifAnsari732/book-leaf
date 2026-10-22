export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, checkRateLimit } from "@/lib/auth";
import {
  verifyRazorpaySignature,
  verifyRazorpayPaymentWithApi,
  resolveAuthoritativeAmount,
} from "@/lib/razorpay";
import {
  isPaymentAlreadyProcessed,
  saveProcessedPayment,
} from "@/lib/repository";
import { VerifyPaymentInputSchema } from "@/types/domain";
import { dispatchActivityEmail } from "@/lib/email";
import { applySecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";

    // Rate Limiting Protection: Max 30 verification attempts per minute per IP
    const rateCheck = checkRateLimit(`payment-verify:${ip}`, 30, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification requests. Please wait a moment before trying again.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = VerifyPaymentInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Incomplete or malformed Razorpay payment verification details",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      planName,
      amount,
      authorName,
      authorEmail,
      authorPhone,
      gstin,
    } = parsed.data;

    // 1. Double-Spend & Replay Attack Defense
    const alreadyProcessed = await isPaymentAlreadyProcessed(razorpay_payment_id);
    if (alreadyProcessed) {
      return NextResponse.json(
        {
          success: false,
          error: "This payment has already been verified and processed. Duplicate requests are rejected.",
          code: "DUPLICATE_PAYMENT_REPLAY",
        },
        { status: 409 }
      );
    }

    // 2. Timing-Safe Cryptographic HMAC-SHA256 Signature Verification
    const sigCheck = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!sigCheck.verified) {
      return NextResponse.json(
        {
          success: false,
          error: sigCheck.error || "Cryptographic payment signature verification failed",
          code: "INVALID_SIGNATURE",
        },
        { status: 400 }
      );
    }

    // 3. Server-side authoritative price resolution
    const pricing = resolveAuthoritativeAmount({
      planId,
      planName,
      amount,
    });

    // 4. Double-Check against Live Razorpay REST API (when configured)
    const apiCheck = await verifyRazorpayPaymentWithApi(
      razorpay_payment_id,
      razorpay_order_id,
      pricing.amountInInr,
      razorpay_signature
    );

    if (!apiCheck.verified) {
      return NextResponse.json(
        {
          success: false,
          error: apiCheck.error || "Razorpay API payment status verification failed",
          code: "API_VERIFICATION_MISMATCH",
        },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const finalAuthorName = (user?.name || authorName || "Author").slice(0, 80);
    const finalAuthorEmail = (user?.email || authorEmail || "author@example.com").toLowerCase().slice(0, 100);
    const finalAuthorPhone = (user?.phone || authorPhone || null);

    // 5. Generate Official Tax Invoice Number and Transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const invoiceNumber = `BL-INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();

    // 6. Record in Processed Ledger (Persistent Idempotency)
    await saveProcessedPayment({
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      signature: razorpay_signature,
      amount: pricing.amountInInr,
      currency: "INR",
      plan_id: pricing.resolvedPlanId,
      plan_name: pricing.resolvedPlanTitle,
      invoice_number: invoiceNumber,
      author_email: finalAuthorEmail,
      author_name: finalAuthorName,
      author_phone: finalAuthorPhone || undefined,
      gstin: gstin || undefined,
      status: "SUCCESS",
      verified_at: nowIso,
      created_at: nowIso,
    });

    // 7. Dispatch Official Payment & Invoice Receipt Email via Nodemailer
    dispatchActivityEmail("PAYMENT", {
      name: finalAuthorName,
      email: finalAuthorEmail,
      userId: user?.user_id,
      authorId: user?.author_id,
      amount: pricing.amountInInr,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      itemDescription: pricing.resolvedPlanTitle,
      timestamp: nowIso,
    }).catch((err) => {
      console.warn("[BookLeaf Payment] Non-blocking email dispatch warning:", err);
    });

    const successResponse = NextResponse.json(
      {
        success: true,
        message: "Payment successfully verified by Razorpay Gateway!",
        receipt: {
          transactionId,
          invoiceNumber,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          planId: pricing.resolvedPlanId,
          planName: pricing.resolvedPlanTitle,
          amount: pricing.amountInInr,
          baseAmount: pricing.baseAmountInInr,
          gstAmount: pricing.gstAmountInInr,
          currency: "INR",
          paidAt: nowIso,
          status: "SUCCESS",
          authorName: finalAuthorName,
          authorEmail: finalAuthorEmail,
          authorPhone: finalAuthorPhone,
          gstin: gstin || null,
          merchant: {
            name: "BookLeaf Publishing Pvt. Ltd.",
            gstin: "07AABCB1234F1Z5",
            address: "Plot 14, Okhla Phase III, New Delhi - 110020",
          },
        },
      },
      { status: 200 }
    );

    return applySecurityHeaders(successResponse, { isApiRoute: true });
  } catch (err: any) {
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: "Failed to verify Razorpay payment",
        details: err?.message,
      },
      { status: 500 }
    );
    return applySecurityHeaders(errorResponse, { isApiRoute: true });
  }
}
