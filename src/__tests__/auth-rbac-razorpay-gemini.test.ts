import { describe, expect, it } from "vitest";
import {
  createAccessToken,
  createRefreshToken,
  createAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  requireRole,
  canAccessAuthorResource,
  checkRateLimit,
  toSafeUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  resolveAuthoritativeAmount,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";
import {
  generateWithGemini,
  generateBookWritingContent,
  generateInstantTicketSolution,
  generateMarketingCampaign,
  isGeminiConfigured,
} from "@/lib/gemini";
import { SafeUser, UserRecord, RegisterInputSchema } from "@/types/domain";
import {
  registerAuthorUser,
  findUserByEmail,
  isPaymentAlreadyProcessed,
  saveProcessedPayment,
} from "@/lib/repository";

describe("BookLeaf Enterprise Auth, RBAC, Razorpay & Gemini Suite", () => {
  const mockAuthor: SafeUser = {
    user_id: "USR_TEST_01",
    author_id: "AUTH001",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    role: "AUTHOR",
    phone: "+91 9876543210",
    city: "New Delhi",
    joined_date: "2026-01-15T00:00:00.000Z",
  };

  const mockAdmin: SafeUser = {
    user_id: "USR_TEST_ADMIN",
    author_id: null,
    name: "Admin User",
    email: "admin@bookleafpub.com",
    role: "ADMIN",
    phone: null,
    city: "Mumbai",
    joined_date: "2026-01-01T00:00:00.000Z",
  };

  // 1. RBAC Dual-Token Generation & Verification
  it("Generates and verifies short-lived Access Token (15m) with role payload", async () => {
    const accessToken = await createAccessToken(mockAuthor);
    expect(accessToken).toBeDefined();
    expect(typeof accessToken).toBe("string");

    const verified = await verifyAccessToken(accessToken);
    expect(verified).not.toBeNull();
    expect(verified?.user_id).toBe(mockAuthor.user_id);
    expect(verified?.role).toBe("AUTHOR");
    expect(verified?.email).toBe(mockAuthor.email);
  });

  it("Generates and verifies long-lived Refresh Token (7d)", async () => {
    const refreshToken = await createRefreshToken(mockAuthor);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe("string");

    const verified = await verifyRefreshToken(refreshToken);
    expect(verified).not.toBeNull();
    expect(verified?.user_id).toBe(mockAuthor.user_id);
    expect(verified?.role).toBe("AUTHOR");
  });

  it("Generates dual auth token pair with correct expiration metrics", async () => {
    const tokens = await createAuthTokens(mockAdmin);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.expiresIn).toBe(900); // 15 mins = 900s

    const verifiedAdmin = await verifyAccessToken(tokens.accessToken);
    expect(verifiedAdmin?.role).toBe("ADMIN");
  });

  // 2. Role-Based Access Control (RBAC) Permissions
  it("Enforces strict RBAC role requirements between AUTHOR and ADMIN", () => {
    const adminCheckForAdmin = requireRole(mockAdmin, "ADMIN");
    expect(adminCheckForAdmin.authorized).toBe(true);

    const authorCheckForAdmin = requireRole(mockAuthor, "ADMIN");
    expect(authorCheckForAdmin.authorized).toBe(false);
    expect(authorCheckForAdmin.reason).toContain("ADMIN role required");

    const authorCheckForAuthor = requireRole(mockAuthor, "AUTHOR");
    expect(authorCheckForAuthor.authorized).toBe(true);
  });

  it("Enforces author resource access isolation", () => {
    // Author can access own resource
    expect(canAccessAuthorResource(mockAuthor, "AUTH001")).toBe(true);
    // Author cannot access another author's resource
    expect(canAccessAuthorResource(mockAuthor, "AUTH999")).toBe(false);
    // Admin has global oversight across all authors
    expect(canAccessAuthorResource(mockAdmin, "AUTH001")).toBe(true);
    expect(canAccessAuthorResource(mockAdmin, "AUTH999")).toBe(true);
  });

  // 3. Razorpay Payment Gateway Integration
  it("Creates Razorpay order with INR currency and paise calculation", async () => {
    const order = await createRazorpayOrder({
      amountInInr: 3999,
      receipt: "rcpt_test_01",
      notes: { plan: "Basic" },
    });

    expect(order.orderId).toBeDefined();
    expect(order.currency).toBe("INR");
    expect(order.amount).toBe(399900); // 3999 * 100 paise
    expect(order.amountInInr).toBe(3999);
  });

  it("Verifies Razorpay payment signatures with timing-safe comparison", () => {
    // Sandbox mock signature verification
    const mockRes = verifyRazorpaySignature(
      "order_test_123",
      "pay_test_456",
      "sig_mock_789"
    );
    expect(mockRes.verified).toBe(true);

    // Missing signature fails verification
    const failRes = verifyRazorpaySignature("order_1", "pay_1", "");
    expect(failRes.verified).toBe(false);

    // Mismatched length handled safely without throwing
    const lengthFail = verifyRazorpaySignature("order_1", "pay_1", "short_sig");
    expect(lengthFail.verified).toBe(false);
  });

  it("Defends against amount tampering: server-side authoritative pricing overrides client requests", () => {
    // Malicious client tries to send amount: 1 for Premium (₹7,999)
    const tampered = resolveAuthoritativeAmount({
      planId: "premium",
      amount: 1, // Tampered client payload
    });
    expect(tampered.amountInInr).toBe(7999);
    expect(tampered.resolvedPlanTitle).toBe("Premium Publishing Plan");
    expect(tampered.baseAmountInInr).toBe(6778.81);
    expect(tampered.gstAmountInInr).toBe(1220.19);

    // Malicious client tries to send amount: 10 for Basic/Essential (₹3,999)
    const tamperedBasic = resolveAuthoritativeAmount({
      planName: "Basic Publishing Plan",
      amount: 10,
    });
    expect(tamperedBasic.amountInInr).toBe(3999);
    expect(tamperedBasic.resolvedPlanTitle).toBe("Basic Publishing Plan");

    // Professional plan (₹14,999)
    const prof = resolveAuthoritativeAmount({
      planId: "professional",
      amount: 99,
    });
    expect(prof.amountInInr).toBe(14999);
  });

  it("Defends against replay attacks: duplicate payment IDs are detected and rejected", async () => {
    const testPaymentId = `pay_replay_test_${Date.now()}`;
    const initialCheck = await isPaymentAlreadyProcessed(testPaymentId);
    expect(initialCheck).toBe(false);

    // Save payment to ledger
    await saveProcessedPayment({
      payment_id: testPaymentId,
      order_id: "order_test_replay",
      signature: "sig_valid_test",
      amount: 3999,
      currency: "INR",
      plan_name: "Basic Publishing Plan",
      invoice_number: `BL-INV-${Date.now()}`,
      author_email: "test.author@example.com",
      author_name: "Test Author",
      status: "SUCCESS",
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    // Second check MUST detect that it has already been processed
    const secondCheck = await isPaymentAlreadyProcessed(testPaymentId);
    expect(secondCheck).toBe(true);
  });

  // 4. Gemini AI Engine
  it("Generates domain-grounded Gemini AI response for royalty questions", async () => {
    const response = await generateWithGemini(
      "How do royalties and payouts work for authors at BookLeaf?"
    );
    expect(response).toBeDefined();
    expect(response.toLowerCase()).toContain("royalt");
    expect(response).toContain("₹1,000");
  });

  it("Generates domain-grounded Gemini AI response for publishing packages", async () => {
    const response = await generateWithGemini(
      "What publishing packages do you offer and how much do they cost?"
    );
    expect(response).toBeDefined();
    expect(response).toContain("Basic");
    expect(response).toContain("Premium");
    expect(response).toContain("₹3,999");
  });

  // 5. Deep Security Hardening & Vulnerability Remediation
  it("Prevents sensitive data exposure: toSafeUser strips password_hash", () => {
    const rawUser: UserRecord = {
      user_id: "USR_LEAK_TEST",
      author_id: "AUTH001",
      name: "Test Author",
      email: "test@example.com",
      password_hash: "$2a$10$superSecretHashThatMustNeverLeak",
      role: "AUTHOR",
      phone: "+91-9999999999",
      city: "Delhi",
      joined_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const safe = toSafeUser(rawUser);
    expect((safe as any).password_hash).toBeUndefined();
    expect(safe.email).toBe("test@example.com");
  });

  it("Enforces rate limiting to prevent brute force / DoS exhaustion", () => {
    const testKey = `test-rate-limit-${Date.now()}`;
    // Max 3 requests
    const res1 = checkRateLimit(testKey, 3, 60_000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(testKey, 3, 60_000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(testKey, 3, 60_000);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th request blocked
    const res4 = checkRateLimit(testKey, 3, 60_000);
    expect(res4.allowed).toBe(false);
    expect(res4.retryAfterSeconds).toBeGreaterThan(0);
  });

  // 6. Author Self-Registration & Unified Access Control Suite
  it("Validates author registration input with strict Zod constraints", () => {
    const valid = RegisterInputSchema.safeParse({
      name: "Rohit Verma",
      email: "rohit.verma@example.com",
      password: "secretPassword123",
      phone: "+91 98765 43210",
      city: "Bengaluru",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("rohit.verma@example.com");
      expect(valid.data.name).toBe("Rohit Verma");
    }

    // Invalid email
    const invalidEmail = RegisterInputSchema.safeParse({
      name: "Rohit Verma",
      email: "not-an-email",
      password: "secretPassword123",
    });
    expect(invalidEmail.success).toBe(false);

    // Password too short (< 6 chars)
    const shortPassword = RegisterInputSchema.safeParse({
      name: "Rohit Verma",
      email: "rohit.verma@example.com",
      password: "123",
    });
    expect(shortPassword.success).toBe(false);
  });

  it("Registers a new author user with next incremental author_id and secure password hash", async () => {
    const testEmail = `new.author.${Date.now()}@bookleaf-test.com`;
    const plainPassword = "SecureAuthorPass2026!";
    const passwordHash = await hashPassword(plainPassword);

    const newUser = await registerAuthorUser({
      name: "Test Author Suite",
      email: testEmail,
      password_hash: passwordHash,
      phone: "+91 9988776655",
      city: "Pune",
    });

    expect(newUser).toBeDefined();
    expect(newUser.author_id).toMatch(/^AUTH\d{3,}$/);
    expect(newUser.role).toBe("AUTHOR");
    expect(newUser.email).toBe(testEmail.toLowerCase());

    // Password verification works
    const isPasswordValid = await verifyPassword(plainPassword, newUser.password_hash);
    expect(isPasswordValid).toBe(true);

    // Can be retrieved via findUserByEmail
    const fetched = await findUserByEmail(testEmail);
    expect(fetched).not.toBeNull();
    expect(fetched?.user_id).toBe(newUser.user_id);
    expect(fetched?.author_id).toBe(newUser.author_id);
  });

  // =========================================================================
  // Gemini AI Publishing Capabilities Suite
  // =========================================================================
  it("Validates Gemini API configuration check", () => {
    // Should return boolean indicating whether GEMINI_API_KEY is active
    const configured = isGeminiConfigured();
    expect(typeof configured).toBe("boolean");
  });

  it("generateBookWritingContent handles chapters, blurbs, and outlines with rich structure", async () => {
    const chapterContent = await generateBookWritingContent({
      action: "chapter",
      title: "Shadows of the Ghats",
      genre: "Mystery / Thriller",
      topic: "The secret meeting by the river",
      tone: "atmospheric and suspenseful",
    });
    expect(chapterContent).toBeDefined();
    expect(typeof chapterContent).toBe("string");
    expect(chapterContent.length).toBeGreaterThan(50);

    const blurbContent = await generateBookWritingContent({
      action: "blurb",
      title: "Wings of Clay",
      genre: "Literary Fiction",
      tone: "captivating",
    });
    expect(blurbContent).toBeDefined();
    expect(blurbContent.length).toBeGreaterThan(50);
  });

  it("generateInstantTicketSolution generates grounded publishing policy resolutions", async () => {
    const solution = await generateInstantTicketSolution({
      subject: "Royalty payout query for Q4",
      description: "When will my royalty be credited to my bank account?",
      category: "Royalty & Payments",
    });
    expect(solution).toBeDefined();
    expect(typeof solution).toBe("string");
    expect(solution.toLowerCase()).toContain("royalt");
  });

  it("generateMarketingCampaign creates Amazon KDP keywords and advertising copy", async () => {
    const campaign = await generateMarketingCampaign({
      bookTitle: "The Varanasi Code",
      genre: "Thriller",
      blurb: "An ancient secret preserved in Varanasi temples.",
    });
    expect(campaign).toBeDefined();
    expect(typeof campaign).toBe("string");
    expect(campaign.length).toBeGreaterThan(50);
  });
});
