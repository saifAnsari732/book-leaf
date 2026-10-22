import { describe, expect, it, beforeEach } from "vitest";
import {
  applySecurityHeaders,
  buildCspHeader,
  validateCsrfOrigin,
  sanitizeNoSql,
  sanitizeXss,
  SECURITY_HEADERS,
} from "@/lib/security";
import {
  evaluateRateLimit,
  clearMemoryRateLimitStore,
  RATE_LIMIT_PRESETS,
} from "@/lib/rate-limiter";
import {
  registerSession,
  isSessionRevoked,
  revokeSession,
  revokeAllOtherSessions,
  getUserActiveSessions,
  blacklistToken,
  isTokenBlacklisted,
  parseDeviceLabel,
} from "@/lib/session-store";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";
import {
  dispatchActivityEmail,
  getEmailHistory,
  getEmailById,
  markEmailAsRead,
  deleteEmail,
} from "@/lib/email";
import { SafeUser } from "@/types/domain";
import { NextRequest, NextResponse } from "next/server";

describe("Enterprise Backend Security, Token Session Tracking & Nodemailer Suite", () => {
  const mockUser: SafeUser = {
    user_id: "USR_SEC_001",
    author_id: "AUTH777",
    name: "Arjun Verma",
    email: "arjun.verma@bookleafpub.com",
    role: "AUTHOR",
    phone: "+91 9123456789",
    city: "Bengaluru",
    joined_date: "2026-02-01T00:00:00.000Z",
  };

  beforeEach(() => {
    clearMemoryRateLimitStore();
  });

  // ==========================================================================
  // 1. Helmet & HTTP Security Headers
  // ==========================================================================
  it("Generates comprehensive CSP directives including Razorpay, YouTube, and ImageKit rules", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("https://checkout.razorpay.com");
    expect(csp).toContain("https://api.razorpay.com");
    expect(csp).toContain("https://ik.imagekit.io");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
  });

  it("Applies Helmet-grade HTTP headers to Next.js responses", () => {
    const initial = NextResponse.json({ test: true });
    const secured = applySecurityHeaders(initial, { isApiRoute: true });

    expect(secured.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(secured.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(secured.headers.get("Strict-Transport-Security")).toContain(
      "max-age=63072000"
    );
    expect(secured.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(secured.headers.get("Cross-Origin-Opener-Policy")).toBe(
      "same-origin-allow-popups"
    );
    expect(secured.headers.get("Cache-Control")).toContain("no-store");
  });

  it("Validates CSRF and blocks hostile cross-origin state-mutating requests", () => {
    // Malicious cross-origin POST
    const maliciousReq = new NextRequest("https://bookleaf.com/api/payment", {
      method: "POST",
      headers: {
        host: "bookleaf.com",
        origin: "https://evil-attacker.com",
      },
    });
    const check1 = validateCsrfOrigin(maliciousReq);
    expect(check1.valid).toBe(false);
    expect(check1.reason).toContain("Cross-site request blocked");

    // Legitimate same-origin POST
    const legitimateReq = new NextRequest("https://bookleaf.com/api/payment", {
      method: "POST",
      headers: {
        host: "bookleaf.com",
        origin: "https://bookleaf.com",
      },
    });
    const check2 = validateCsrfOrigin(legitimateReq);
    expect(check2.valid).toBe(true);

    // Exempt safe GET
    const safeGetReq = new NextRequest("https://bookleaf.com/api/books", {
      method: "GET",
      headers: {
        origin: "https://some-other.com",
      },
    });
    expect(validateCsrfOrigin(safeGetReq).valid).toBe(true);
  });

  it("Sanitizes NoSQL injection operators and XSS payloads", () => {
    const maliciousPayload = {
      email: "user@example.com",
      $where: "function() { return true; }",
      nested: {
        "admin.role": "ADMIN",
        validField: "clean text",
      },
    };

    const sanitized = sanitizeNoSql(maliciousPayload);
    expect((sanitized as any).$where).toBeUndefined();
    expect((sanitized as any).nested["admin.role"]).toBeUndefined();
    expect((sanitized as any).nested.validField).toBe("clean text");

    const xssString = "<script>alert('pwned')</script>Hello World";
    expect(sanitizeXss(xssString)).toBe("Hello World");
  });

  // ==========================================================================
  // 2. Multi-tier Distributed Rate Limiting
  // ==========================================================================
  it("Enforces rate limiting and returns correct headers and retryAfterSeconds", async () => {
    const key = "test-user-login-ip-1";
    const config = { maxRequests: 3, windowMs: 10_000 };

    // Request 1, 2, 3 allowed
    const r1 = await evaluateRateLimit(key, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = await evaluateRateLimit(key, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await evaluateRateLimit(key, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // Request 4 blocked with 429 semantics
    const r4 = await evaluateRateLimit(key, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.retryAfterSeconds).toBeGreaterThan(0);
    expect(r4.headers["Retry-After"]).toBeDefined();
    expect(r4.headers["RateLimit-Limit"]).toBe("3");
  });

  // ==========================================================================
  // 3. Active Session Tracking & Token Revocation
  // ==========================================================================
  it("Tracks active sessions and parses user agent to human readable device label", async () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    const label = parseDeviceLabel(ua);
    expect(label).toBe("Chrome on Windows PC");

    const session = await registerSession({
      userId: mockUser.user_id,
      authorId: mockUser.author_id,
      email: mockUser.email,
      role: mockUser.role,
      ip: "103.25.120.4",
      userAgent: ua,
    });

    expect(session.session_id).toBeDefined();
    expect(session.device_label).toBe("Chrome on Windows PC");
    expect(await isSessionRevoked(session.session_id)).toBe(false);
  });

  it("Revokes specific session and invalidates corresponding JWT tokens", async () => {
    const session = await registerSession({
      userId: mockUser.user_id,
      email: mockUser.email,
      role: mockUser.role,
      ip: "127.0.0.1",
      userAgent: "TestAgent",
    });

    // Create token tied to session
    const accessToken = await createAccessToken(mockUser, session.session_id);
    const verifiedBefore = await verifyAccessToken(accessToken);
    expect(verifiedBefore).not.toBeNull();
    expect(verifiedBefore?.user_id).toBe(mockUser.user_id);

    // Revoke the session
    const revoked = await revokeSession(session.session_id, mockUser.user_id);
    expect(revoked).toBe(true);
    expect(await isSessionRevoked(session.session_id)).toBe(true);

    // Token must now be rejected
    const verifiedAfter = await verifyAccessToken(accessToken);
    expect(verifiedAfter).toBeNull();
  });

  it("Allows revoking all other sessions while keeping current session active", async () => {
    const s1 = await registerSession({
      userId: mockUser.user_id,
      email: mockUser.email,
      role: mockUser.role,
      ip: "1.1.1.1",
      userAgent: "Device A",
    });
    const s2 = await registerSession({
      userId: mockUser.user_id,
      email: mockUser.email,
      role: mockUser.role,
      ip: "2.2.2.2",
      userAgent: "Device B",
    });

    // Revoke all except s2
    const count = await revokeAllOtherSessions(mockUser.user_id, s2.session_id);
    expect(count).toBeGreaterThanOrEqual(1);

    expect(await isSessionRevoked(s1.session_id)).toBe(true);
    expect(await isSessionRevoked(s2.session_id)).toBe(false);
  });

  // ==========================================================================
  // 4. Nodemailer Activity Emails
  // ==========================================================================
  it("Dispatches Login Security Alert email via Nodemailer and stores in activity stream", async () => {
    const emailRecord = await dispatchActivityEmail("LOGIN", {
      name: mockUser.name,
      email: mockUser.email,
      userId: mockUser.user_id,
      ip: "122.161.49.20",
      device: "Edge on Windows PC",
      timestamp: new Date().toISOString(),
    });

    expect(emailRecord.email_id).toBeDefined();
    expect(emailRecord.category).toBe("LOGIN_ALERT");
    expect(emailRecord.subject).toContain("Security Alert: New Sign-in");
    expect(emailRecord.html_content).toContain("BookLeaf Publishing");
    expect(emailRecord.html_content).toContain("122.161.49.20");

    const retrieved = getEmailById(emailRecord.email_id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email_id).toBe(emailRecord.email_id);
  });

  it("Dispatches Payment & Invoice Receipt email via Nodemailer with INR currency formatting", async () => {
    const paymentEmail = await dispatchActivityEmail("PAYMENT", {
      name: mockUser.name,
      email: mockUser.email,
      userId: mockUser.user_id,
      amount: 4999,
      orderId: "order_rzp_98765",
      paymentId: "pay_rzp_12345",
      itemDescription: "International Hardcover Global Distribution",
      timestamp: new Date().toISOString(),
    });

    expect(paymentEmail.category).toBe("PAYMENT_RECEIPT");
    expect(paymentEmail.subject).toContain("₹4,999");
    expect(paymentEmail.html_content).toContain("pay_rzp_12345");
    expect(paymentEmail.html_content).toContain("order_rzp_98765");
  });

  it("Filters, marks as read, and deletes activity emails in the mailbox", async () => {
    const ticketEmail = await dispatchActivityEmail("TICKET", {
      name: mockUser.name,
      email: mockUser.email,
      userId: mockUser.user_id,
      ticketId: "TCK-9901",
      subject: "Royalty withdrawal processed",
      status: "Resolved",
      priority: "Normal",
      messagePreview: "Your payout has been credited via IMPS.",
      actorName: "Support Executive",
      actorRole: "Admin",
      timestamp: new Date().toISOString(),
    });

    // Mark as read
    expect(ticketEmail.read_at).toBeNull();
    const marked = markEmailAsRead(ticketEmail.email_id);
    expect(marked).toBe(true);

    const updated = getEmailById(ticketEmail.email_id);
    expect(updated?.read_at).not.toBeNull();

    // Query email history
    const history = await getEmailHistory({
      userId: mockUser.user_id,
      category: "TICKET_UPDATE",
    });
    expect(history.some((e) => e.email_id === ticketEmail.email_id)).toBe(true);

    // Delete email
    const deleted = deleteEmail(ticketEmail.email_id);
    expect(deleted).toBe(true);
    expect(getEmailById(ticketEmail.email_id)).toBeNull();
  });
});
