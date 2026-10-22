import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { NextRequest } from "next/server";
import { sanitizeNoSql, validateCsrfOrigin } from "../src/lib/security";
import { checkRateLimit } from "../src/lib/auth";
import {
  generateWithGemini,
  generateBookWritingContent,
  generateInstantTicketSolution,
  generateMarketingCampaign,
  isGeminiConfigured,
} from "../src/lib/gemini";
import {
  renderLoginAlertEmail,
  renderPaymentReceiptEmail,
  renderTicketUpdateEmail,
  renderBookPublishingEmail,
  sendEmail,
  getEmailHistory,
} from "../src/lib/email";
import {
  registerSession,
  isSessionValid,
  revokeSession,
  getUserActiveSessions,
} from "../src/lib/session-store";
import {
  verifyRazorpaySignature,
  resolveAuthoritativeAmount,
} from "../src/lib/razorpay";

async function runProductionDeepDive() {
  console.log("===============================================================");
  console.log("   BOOKLEAF PRODUCTION DEEP DIVE & ZERO-ERROR STRESS AUDIT    ");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: NoSQL & Object Injection Neutralization
  // --------------------------------------------------------------------------
  console.log("--- 1. Security & Injection Defense ---");
  const maliciousPayload = {
    username: { $gt: "" },
    password: { $ne: null },
    normalField: "Priya Sharma",
    nested: {
      "injection.key": "bad_value",
      safeNested: 12345,
    },
  };
  const sanitized = sanitizeNoSql(maliciousPayload);
  assert(sanitized.username === undefined, "Sanitizes operator $gt from payload");
  assert(sanitized.password === undefined, "Sanitizes operator $ne from payload");
  assert(sanitized.normalField === "Priya Sharma", "Preserves legitimate values");
  assert(sanitized.nested?.safeNested === 12345, "Preserves safe nested values");
  assert(sanitized.nested?.["injection.key"] === undefined, "Strips dotted prototype keys");

  // --------------------------------------------------------------------------
  // TEST 2: CSRF Cross-Origin Host Verification
  // --------------------------------------------------------------------------
  console.log("\n--- 2. CSRF Cross-Origin Defense ---");
  const legitReq = new NextRequest("https://bookleafpub.com/api/author/books/create", {
    method: "POST",
    headers: {
      origin: "https://bookleafpub.com",
      host: "bookleafpub.com",
    },
  });
  const legitCheck = validateCsrfOrigin(legitReq);
  assert(legitCheck.valid === true, "Permits same-origin state-mutating requests");

  const attackerReq = new NextRequest("https://bookleafpub.com/api/author/books/create", {
    method: "POST",
    headers: {
      origin: "https://evil-hacker-site.com",
      host: "bookleafpub.com",
    },
  });
  const attackCheck = validateCsrfOrigin(attackerReq);
  assert(attackCheck.valid === false, "Blocks cross-origin mutating requests");

  // --------------------------------------------------------------------------
  // TEST 3: Distributed Rate Limiting Precision
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Rate Limiter Edge Behavior ---");
  const testIp = `deep-dive-${Date.now()}`;
  let rateBlocked = false;
  for (let i = 0; i < 25; i++) {
    const res = checkRateLimit(testIp, 20, 60_000);
    if (!res.allowed) {
      rateBlocked = true;
      assert(res.retryAfterSeconds > 0, "Provides positive retryAfterSeconds header value");
      break;
    }
  }
  assert(rateBlocked === true, "Strictly limits bursts beyond quota threshold (20 req/min)");

  // --------------------------------------------------------------------------
  // TEST 4: Session Store, Token Lifecycle & Revocation
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Enterprise Session Lifecycle & Remote Logout ---");
  const session = await registerSession({
    userId: "USR_TEST_01",
    authorId: "AUTH001",
    email: "priya.sharma@email.com",
    role: "AUTHOR",
    ip: "103.21.244.2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    ttlSeconds: 3600,
  });
  assert(session.session_id.startsWith("sess_"), "Generates cryptographic session ID");
  assert(session.device_label.includes("Windows"), "Accurately parses user agent device label");

  const isValidBefore = await isSessionValid(session.session_id);
  assert(isValidBefore === true, "Session is immediately active after registration");

  const userSessions = await getUserActiveSessions("USR_TEST_01", session.session_id);
  assert(userSessions.length > 0, "Retrieves author session list");
  assert(userSessions[0].is_current === true, "Correctly identifies current session");

  await revokeSession(session.session_id);
  const isValidAfter = await isSessionValid(session.session_id);
  assert(isValidAfter === false, "Instantly invalidates revoked session");

  // --------------------------------------------------------------------------
  // TEST 5: Nodemailer Templates & Activity Hub
  // --------------------------------------------------------------------------
  console.log("\n--- 5. Nodemailer Activity Engine ---");
  const loginAlert = renderLoginAlertEmail({
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    ip: "103.21.244.2",
    device: "Chrome on Windows PC",
    location: "New Delhi",
    timestamp: new Date().toISOString(),
  });
  assert(loginAlert.subject.includes("Security Alert: New Sign-in"), "Generates security alert subject");
  assert(loginAlert.html.includes("Priya Sharma"), "Injects recipient name in HTML");

  const paymentAlert = renderPaymentReceiptEmail({
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    itemDescription: "Premium Publishing Plan",
    amount: 7999,
    paymentId: "pay_test_12345",
    orderId: "order_test_67890",
    timestamp: new Date().toISOString(),
  });
  assert(paymentAlert.subject.includes("Payment Confirmation"), "Generates payment confirmation subject");
  assert(paymentAlert.html.includes("7,999"), "Formats currency with Indian commas");

  const sentResult = await sendEmail({
    to: "priya.sharma@email.com",
    name: "Priya Sharma",
    userId: "USR_TEST_01",
    authorId: "AUTH001",
    subject: "Deep Dive Test Notification",
    category: "GENERAL",
    html: "<p>Deep dive verification email</p>",
    text: "Deep dive verification email",
  });
  assert(Boolean(sentResult.email_id), "Saves dispatched email to activity log");

  const inbox = await getEmailHistory({ userId: "USR_TEST_01" });
  assert(inbox.some((e) => e.email_id === sentResult.email_id), "Activity shows in author inbox");

  // --------------------------------------------------------------------------
  // TEST 6: Razorpay Zero-Loophole Financial Integrity
  // --------------------------------------------------------------------------
  console.log("\n--- 6. Financial & Razorpay Security ---");
  const basicAmount = resolveAuthoritativeAmount("Basic Publishing Plan");
  const premiumAmount = resolveAuthoritativeAmount("Premium Publishing Plan");
  const proAmount = resolveAuthoritativeAmount("Professional Publishing Plan");
  assert(basicAmount.amountInInr === 3999, "Authoritative Basic Plan is ₹3,999");
  assert(premiumAmount.amountInInr === 7999, "Authoritative Premium Plan is ₹7,999");
  assert(proAmount.amountInInr === 14999, "Authoritative Professional Plan is ₹14,999");

  // Signature verification rejection of spoofed payment
  const spoofSignature = verifyRazorpaySignature(
    "order_legit_123",
    "pay_legit_456",
    "fake_spoofed_signature_from_client"
  );
  assert(spoofSignature.verified === false, "Rejects fraudulent Razorpay signature");

  // --------------------------------------------------------------------------
  // TEST 7: Gemini AI Suite & Fail-Open Grounding
  // --------------------------------------------------------------------------
  console.log("\n--- 7. Gemini AI Suite Capabilities ---");
  console.log(`Gemini Configured: ${isGeminiConfigured()}`);

  const chapterGen = await generateBookWritingContent({
    action: "chapter",
    title: "Shadows Over the Ganges",
    genre: "Thriller",
    topic: "The stolen manuscript discovery",
  });
  assert(chapterGen.length > 50, "AI Book Writer produces full chapters");

  const blurbGen = await generateBookWritingContent({
    action: "blurb",
    title: "Shadows Over the Ganges",
    genre: "Thriller",
  });
  assert(blurbGen.length > 50, "AI Book Writer produces marketing blurbs");

  const instantTicketHelp = await generateInstantTicketSolution({
    subject: "Royalty calculation question",
    description: "How is the 100% royalty calculated for paperback sales?",
    category: "Royalty & Payments",
  });
  assert(instantTicketHelp.toLowerCase().includes("royalt"), "Instant Ticket AI resolves publishing queries");

  const marketingPack = await generateMarketingCampaign({
    bookTitle: "Shadows Over the Ganges",
    genre: "Thriller",
  });
  assert(marketingPack.length > 50, "AI Marketing Suite generates keywords & ad copy");

  console.log("\n===============================================================");
  console.log(`   AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED           `);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionDeepDive().catch((err) => {
  console.error("Deep dive test crashed with error:", err);
  process.exit(1);
});
