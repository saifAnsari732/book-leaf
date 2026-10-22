export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { isPaymentAlreadyProcessed, saveProcessedPayment } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    // Verify cryptographic signature against webhook secret
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity) {
        const paymentId = paymentEntity.id;
        const alreadyDone = await isPaymentAlreadyProcessed(paymentId);

        if (!alreadyDone) {
          const invoiceNumber = `BL-INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          const nowIso = new Date().toISOString();
          const amountInInr = Number(paymentEntity.amount) / 100;

          await saveProcessedPayment({
            payment_id: paymentId,
            order_id: paymentEntity.order_id || `webhook_${Date.now()}`,
            signature: signature.slice(0, 64),
            amount: amountInInr,
            currency: paymentEntity.currency || "INR",
            plan_name: paymentEntity.notes?.planName || "BookLeaf Publishing Package",
            invoice_number: invoiceNumber,
            author_email: paymentEntity.email || paymentEntity.notes?.userEmail || "author@example.com",
            author_name: paymentEntity.notes?.userName || "Author",
            author_phone: paymentEntity.contact || paymentEntity.notes?.userPhone || undefined,
            status: "SUCCESS",
            verified_at: nowIso,
            created_at: nowIso,
          });
        }
      }
    }

    return NextResponse.json({ success: true, event: eventType }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Webhook processing error", details: err?.message },
      { status: 500 }
    );
  }
}
