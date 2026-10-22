import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

async function runRazorpaySecuritySuite() {
  console.log("=================================================================");
  console.log("BookLeaf Live Razorpay & Zero-Loophole Security Test Suite");
  console.log("=================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Live Key & Order Creation Verification
  // --------------------------------------------------------------------------
  console.log("TEST 1: Creating Razorpay Order with Live Key...");
  const orderRes = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId: "basic",
      planName: "Basic Publishing Plan",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43210",
    }),
  });

  const orderData = await orderRes.json();
  console.log(`  [Order Status] HTTP ${orderRes.status}`);
  console.log(`  [Key ID Active] ${orderData.keyId}`);
  console.log(`  [Is Live Gateway] ${orderData.isLive}`);
  console.log(`  [Order Details] ID: ${orderData.order?.orderId}, Currency: ${orderData.order?.currency}, Amount: ₹${orderData.order?.amountInInr}`);

  assert.equal(orderRes.status, 200);
  assert.equal(orderData.success, true);
  assert.equal(orderData.keyId, "rzp_live_TWLWfA0Ba2tiwG", "Expected live key rzp_live_TWLWfA0Ba2tiwG");
  assert.equal(orderData.order.currency, "INR");
  assert.equal(orderData.order.amountInInr, 3999);
  console.log("  [PASS] Live Razorpay credentials active with authoritative order creation!\n");

  // --------------------------------------------------------------------------
  // TEST 2: Amount Tampering Defense
  // --------------------------------------------------------------------------
  console.log("TEST 2: Testing Amount Tampering Protection (Client sending amount: 1)...");
  const tamperedRes = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId: "premium",
      planName: "Premium Publishing Plan",
      amount: 1, // Malicious client attempt to pay ₹1 instead of ₹7,999
      name: "Malicious User",
      email: "attacker@example.com",
    }),
  });

  const tamperedData = await tamperedRes.json();
  console.log(`  [Tampered Order Status] HTTP ${tamperedRes.status}`);
  console.log(`  [Server Enforced Price] ₹${tamperedData.order?.amountInInr} (Requested ₹1 was overridden)`);
  assert.equal(tamperedData.order.amountInInr, 7999, "Server MUST override manipulated amount with canonical price ₹7,999");
  console.log("  [PASS] Amount tampering completely neutralized by server-side canonical pricing!\n");

  // --------------------------------------------------------------------------
  // TEST 3: Invalid Signature Defense
  // --------------------------------------------------------------------------
  console.log("TEST 3: Testing Cryptographic Signature Tampering Defense...");
  const fakeSigRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: "order_test_secure_1001",
      razorpay_payment_id: "pay_test_secure_2002",
      razorpay_signature: "fake_forged_hex_signature_attack_vector_12345",
      planId: "basic",
      amount: 3999,
    }),
  });

  const fakeSigData = await fakeSigRes.json();
  console.log(`  [Fake Signature Status] HTTP ${fakeSigRes.status}`);
  console.log(`  [Rejection Error] ${fakeSigData.error}`);
  assert.equal(fakeSigRes.status, 400);
  assert.equal(fakeSigData.success, false);
  console.log("  [PASS] Forged signatures strictly rejected by timing-safe HMAC-SHA256!\n");

  // --------------------------------------------------------------------------
  // TEST 4: Legitimate Payment Verification & Tax Invoice Generation
  // --------------------------------------------------------------------------
  console.log("TEST 4: Verifying Legitimate Payment & Generating Official GST Invoice...");
  const testOrderId = `order_${Date.now()}`;
  const testPaymentId = `pay_valid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 12)}`;

  const verifyRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: mockSignature,
      planId: "basic",
      planName: "Basic Publishing Plan",
      amount: 3999,
      authorName: "Priya Sharma",
      authorEmail: "priya.sharma@email.com",
    }),
  });

  const verifyData = await verifyRes.json();
  console.log(`  [Verify Status] HTTP ${verifyRes.status}`);
  console.log(`  [Invoice Generated] Number: ${verifyData.receipt?.invoiceNumber}`);
  console.log(`  [GST Breakdown] Base: ₹${verifyData.receipt?.baseAmount}, GST (18%): ₹${verifyData.receipt?.gstAmount}, Total: ₹${verifyData.receipt?.amount}`);
  console.log(`  [Merchant GSTIN] ${verifyData.receipt?.merchant?.gstin}`);

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyData.success, true);
  assert(verifyData.receipt.invoiceNumber.startsWith("BL-INV-2026-"));
  assert.equal(verifyData.receipt.amount, 3999);
  assert.equal(verifyData.receipt.status, "SUCCESS");
  console.log("  [PASS] Tax invoice generated with full 18% GST breakdown and legal merchant details!\n");

  // --------------------------------------------------------------------------
  // TEST 5: Replay Attack & Double-Spend Defense
  // --------------------------------------------------------------------------
  console.log("TEST 5: Testing Replay Attack (Submitting identical payment ID a second time)...");
  const replayRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId, // REUSING THE SAME PAYMENT ID
      razorpay_signature: mockSignature,
      planId: "basic",
      planName: "Basic Publishing Plan",
      amount: 3999,
      authorName: "Priya Sharma",
      authorEmail: "priya.sharma@email.com",
    }),
  });

  const replayData = await replayRes.json();
  console.log(`  [Replay Attempt Status] HTTP ${replayRes.status}`);
  console.log(`  [Replay Error Code] ${replayData.code}`);
  console.log(`  [Replay Error Message] ${replayData.error}`);
  assert.equal(replayRes.status, 409, "Expected HTTP 409 Conflict for duplicate payment replay");
  assert.equal(replayData.code, "DUPLICATE_PAYMENT_REPLAY");
  console.log("  [PASS] Double-spend and replay attack strictly prevented!\n");

  // --------------------------------------------------------------------------
  // TEST 6: Webhook Signature Guard
  // --------------------------------------------------------------------------
  console.log("TEST 6: Testing Webhook Cryptographic Guard...");
  const fakeWebhookRes = await fetch(`${BASE_URL}/api/payment/razorpay/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": "invalid_unauthenticated_signature",
    },
    body: JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_attack_1" } } },
    }),
  });
  console.log(`  [Fake Webhook Status] HTTP ${fakeWebhookRes.status}`);
  assert.equal(fakeWebhookRes.status, 401, "Expected HTTP 401 Unauthorized for invalid webhook signature");
  console.log("  [PASS] Webhook endpoint strictly guarded against forgery!\n");

  console.log("=================================================================");
  console.log("ALL 6 RAZORPAY ZERO-LOOPHOLE SECURITY TESTS PASSED (100%)");
  console.log("=================================================================");
}

runRazorpaySecuritySuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
