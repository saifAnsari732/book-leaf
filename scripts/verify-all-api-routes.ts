/**
 * Comprehensive API Routes End-to-End Verification Suite
 * Tests all 42 API endpoints across Author, Admin, Auth, Payments, Email, Upload, AI, and Public routes.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface TestResult {
  category: string;
  name: string;
  method: string;
  endpoint: string;
  expectedStatus: number | number[];
  receivedStatus: number;
  durationMs: number;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

// Cookie stores
let authorCookies: Record<string, string> = {};
let adminCookies: Record<string, string> = {};
let authorAccessToken = "";
let adminAccessToken = "";

function extractCookies(res: Response, current: Record<string, string>): Record<string, string> {
  const updated = { ...current };
  let setCookies: string[] = [];
  if (typeof (res.headers as any).getSetCookie === "function") {
    setCookies = (res.headers as any).getSetCookie();
  } else {
    const raw = res.headers.get("set-cookie");
    if (raw) setCookies = [raw];
  }

  for (const c of setCookies) {
    if (!c) continue;
    const [nameVal] = c.split(";");
    const eqIdx = nameVal.indexOf("=");
    if (eqIdx > 0) {
      const name = nameVal.slice(0, eqIdx).trim();
      const val = nameVal.slice(eqIdx + 1).trim();
      updated[name] = val;
    }
  }
  return updated;
}

function cookieString(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function api(
  method: string,
  endpoint: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    timeoutMs?: number;
  } = {}
) {
  const url = `${BASE_URL}${endpoint}`;
  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  let bodyStr: string | undefined = undefined;
  if (options.body !== undefined) {
    bodyStr = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    if (!reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }
  }

  if (options.cookies && Object.keys(options.cookies).length > 0) {
    reqHeaders["Cookie"] = cookieString(options.cookies);
  }

  const signal = AbortSignal.timeout(options.timeoutMs || 10000);

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: bodyStr,
    signal,
  });

  let parsedBody: any = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    parsedBody = await res.json().catch(() => null);
  } else {
    parsedBody = await res.text().catch(() => "");
  }

  return {
    status: res.status,
    headers: res.headers,
    body: parsedBody,
    res,
  };
}

async function runTest(
  category: string,
  name: string,
  method: string,
  endpoint: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    expectedStatus: number | number[];
    validate?: (body: any) => boolean;
    timeoutMs?: number;
  }
) {
  const start = Date.now();
  let receivedStatus = 0;
  let passed = false;
  let notes = "";
  let resObj: any = null;

  try {
    const res = await api(method, endpoint, {
      body: options.body,
      headers: options.headers,
      cookies: options.cookies,
      timeoutMs: options.timeoutMs,
    });
    resObj = res;
    receivedStatus = res.status;

    const expected = Array.isArray(options.expectedStatus)
      ? options.expectedStatus
      : [options.expectedStatus];

    const statusMatch = expected.includes(receivedStatus);
    const bodyValid = options.validate ? options.validate(res.body) : true;
    passed = statusMatch && bodyValid;

    if (!statusMatch) {
      notes = `Expected [${expected.join(",")}], got ${receivedStatus}. Response: ${typeof res.body === "object" ? JSON.stringify(res.body).slice(0, 100) : String(res.body).slice(0, 100)}`;
    } else if (!bodyValid) {
      notes = `Validation check failed. Body: ${typeof res.body === "object" ? JSON.stringify(res.body).slice(0, 100) : String(res.body).slice(0, 100)}`;
    }

    return res;
  } catch (err: any) {
    passed = false;
    notes = `Execution error: ${err.message}`;
    return {
      status: 0,
      headers: new Headers(),
      body: null,
      res: null,
    };
  } finally {
    results.push({
      category,
      name,
      method,
      endpoint,
      expectedStatus: options.expectedStatus,
      receivedStatus,
      durationMs: Date.now() - start,
      passed,
      notes,
    });
  }
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 STARTING FULL BOOKLEAF API ROUTE VERIFICATION SUITE");
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. PUBLIC & DOCUMENTATION ROUTES
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying Public & System Documentation Routes...");

  await runTest("Public", "OpenAPI Documentation JSON", "GET", "/api/docs", {
    expectedStatus: 200,
    validate: (b) => b?.openapi === "3.0.3" && b?.info?.title?.includes("BookLeaf"),
  });

  await runTest("Public", "Demo Accounts Endpoint", "GET", "/api/auth/demo-accounts", {
    expectedStatus: 200,
    validate: (b) => Array.isArray(b?.accounts) && b.accounts.length >= 10,
  });

  await runTest("Public", "Public Ticket Tracking - Missing ID (400)", "GET", "/api/tickets/track", {
    expectedStatus: 400,
  });

  await runTest("Public", "Public Ticket Tracking - Valid Seeded Ticket", "GET", "/api/tickets/track?id=TKT-1001", {
    expectedStatus: [200, 404],
    validate: (b) => b?.success === true,
  });

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATION LIFECYCLE & SESSIONS
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying Authentication Routes & Session Management...");

  // Author Login
  const authorLogin = await runTest("Auth", "Author Login (Priya Sharma)", "POST", "/api/auth/login", {
    expectedStatus: 200,
    body: {
      email: "priya.sharma@email.com",
      password: "author123",
      rememberMe: true,
    },
    validate: (b) => b?.success === true && b?.user?.role === "AUTHOR",
  });

  if (authorLogin?.res) {
    authorCookies = extractCookies(authorLogin.res, authorCookies);
    authorAccessToken = authorLogin.body?.accessToken || "";
  }

  // Admin Login
  const adminLogin = await runTest("Auth", "Admin Login (Saloni Mourya)", "POST", "/api/auth/login", {
    expectedStatus: 200,
    body: {
      email: "admin@bookleafpub.com",
      password: "admin123",
      rememberMe: true,
    },
    validate: (b) => b?.success === true && b?.user?.role === "ADMIN",
  });

  if (adminLogin?.res) {
    adminCookies = extractCookies(adminLogin.res, adminCookies);
    adminAccessToken = adminLogin.body?.accessToken || "";
  }

  // Register New Author Route
  const uniqueTestEmail = `verify.author.${Date.now()}@example.com`;
  await runTest("Auth", "Register New Author Account", "POST", "/api/auth/register", {
    expectedStatus: 201,
    body: {
      name: "Rohan Varma",
      email: uniqueTestEmail,
      password: "authorTest123",
      phone: "+91 9876543210",
      city: "Bengaluru, Karnataka",
    },
    validate: (b) => b?.success === true && b?.user?.author_id?.startsWith("AUTH"),
  });

  // Author Session Verification
  await runTest("Auth", "Get Active Session (Author)", "GET", "/api/auth/session", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.user?.email === "priya.sharma@email.com",
  });

  // Admin Session Verification
  await runTest("Auth", "Get Active Session (Admin)", "GET", "/api/auth/session", {
    cookies: adminCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.user?.email === "admin@bookleafpub.com",
  });

  // Unauthenticated Session Check (401)
  await runTest("Auth", "Unauthenticated Session Check (401)", "GET", "/api/auth/session", {
    expectedStatus: 401,
  });

  // Author Active Sessions List
  await runTest("Auth", "Get User Sessions List", "GET", "/api/auth/sessions", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && Array.isArray(b?.sessions),
  });

  // Quick Login Route
  await runTest("Auth", "Quick Login (Author Role)", "POST", "/api/auth/quick-login", {
    expectedStatus: 200,
    body: { role: "AUTHOR", email: "rohit.kapoor@email.com" },
    validate: (b) => b?.success === true,
  });

  // ---------------------------------------------------------------------------
  // 3. AUTHOR DESK ENDPOINTS
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying Author Desk Endpoints...");

  await runTest("Author", "Author Dashboard Overview", "GET", "/api/author/dashboard", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.metrics !== undefined,
  });

  await runTest("Author", "Author Books Catalog", "GET", "/api/author/books", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && Array.isArray(b?.books),
  });

  await runTest("Author", "Author Channel Sales Breakdown", "GET", "/api/author/sales", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true,
  });

  const royaltyRes = await runTest("Author", "Author Royalty & Wallet Ledger", "GET", "/api/author/royalty", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.metrics?.withdrawableBalance !== undefined,
  });

  await runTest("Author", "Save Bank Details (IFSC auto-detect)", "POST", "/api/author/royalty/bank-details", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: {
      account_holder_name: "Priya Sharma",
      account_number: "50100234567890",
      ifsc_code: "HDFC0001234",
      bank_name: "HDFC Bank",
      pan_number: "ABCDE1234F",
    },
    validate: (b) => b?.success === true,
  });

  // If a withdrawal exists, simulate payout; otherwise verify 400 validation
  const existingWithdrawal = royaltyRes?.body?.withdrawals?.[0];
  if (existingWithdrawal?.withdrawal_id) {
    await runTest("Author", "RazorpayX Payout Simulator (Valid Withdrawal)", "POST", `/api/author/royalty/simulate-payout?withdrawalId=${existingWithdrawal.withdrawal_id}`, {
      cookies: authorCookies,
      expectedStatus: 200,
      validate: (b) => b?.success === true && (b?.withdrawal?.status !== undefined || b?.record?.status !== undefined),
    });
  } else {
    await runTest("Author", "RazorpayX Payout Simulator - Missing ID (400)", "POST", "/api/author/royalty/simulate-payout", {
      cookies: authorCookies,
      expectedStatus: 400,
      validate: (b) => b?.success === false,
    });
  }

  await runTest("Author", "Start New Book Wizard Intake", "POST", "/api/author/books/create", {
    cookies: authorCookies,
    expectedStatus: [200, 201],
    body: {
      title: `E2E Automated Novel ${Date.now()}`,
      subtitle: "Verified by Test Runner",
      author_name: "Priya Sharma",
      language: "English",
      genre: "General Fiction",
      trim_size: "5x8 inches",
      binding: "Paperback",
      target_mrp: 399,
    },
    validate: (b) => b?.success === true && b?.book?.book_id !== undefined,
  });

  // Ticket Operations
  let testTicketId = "TKT-1001";
  const ticketCreate = await runTest("Author", "Submit New Grievance Ticket", "POST", "/api/author/tickets", {
    cookies: authorCookies,
    expectedStatus: 201,
    body: {
      subject: "E2E Automated Test Inquiry: Royalty Reconciliation",
      description: "Verifying complete ticket lifecycle, dual transactional email alerts, and SLA indicators.",
      category: "Royalty & Payments",
      priority: "Medium",
    },
    validate: (b) => b?.success === true && b?.ticket?.ticket_id !== undefined,
  });

  if (ticketCreate?.body?.ticket?.ticket_id) {
    testTicketId = ticketCreate.body.ticket.ticket_id;
  }

  await runTest("Author", "List Author Support Tickets", "GET", "/api/author/tickets", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && Array.isArray(b?.tickets),
  });

  await runTest("Author", `Get Single Ticket Detail (#${testTicketId})`, "GET", `/api/author/tickets/${testTicketId}`, {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.ticket?.ticket_id === testTicketId,
  });

  await runTest("Author", "Author Post Message to Ticket", "POST", `/api/author/tickets/${testTicketId}/messages`, {
    cookies: authorCookies,
    expectedStatus: 201,
    body: { content: "Checking in on the status of this ticket verification test." },
    validate: (b) => b?.success === true,
  });

  // ---------------------------------------------------------------------------
  // 4. ADMIN OPERATIONS CONSOLE ENDPOINTS
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying Admin Operations Console Endpoints...");

  await runTest("Admin", "Admin Operations Dashboard Metrics", "GET", "/api/admin/dashboard", {
    cookies: adminCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.metrics?.totalTickets !== undefined,
  });

  await runTest("Admin", "Admin Ticket Queue (Search & Filters)", "GET", "/api/admin/tickets?limit=10&page=1&status=ALL", {
    cookies: adminCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && Array.isArray(b?.tickets),
  });

  await runTest("Admin", `Admin Ticket Detail Workbench (#${testTicketId})`, "GET", `/api/admin/tickets/${testTicketId}`, {
    cookies: adminCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.ticket !== undefined,
  });

  await runTest("Admin", "Admin Assign Ticket", "POST", `/api/admin/tickets/${testTicketId}/assign`, {
    cookies: adminCookies,
    expectedStatus: 200,
    body: { assigned_to: "Saloni Mourya" },
    validate: (b) => b?.success === true,
  });

  await runTest("Admin", "Admin Add Private Internal Note (Isolated)", "POST", `/api/admin/tickets/${testTicketId}/notes`, {
    cookies: adminCookies,
    expectedStatus: 201,
    body: { content: "Internal verification note: Verified via automated testing script." },
    validate: (b) => b?.success === true && b?.note !== undefined,
  });

  await runTest("Admin", "Admin Refresh Editorial Draft Response", "POST", `/api/admin/tickets/${testTicketId}/draft-reply`, {
    cookies: adminCookies,
    expectedStatus: 200,
    body: { custom_instruction: "Provide prompt resolution note." },
    validate: (b) => b?.success === true && b?.ai_metadata?.draft_reply !== undefined,
  });

  await runTest("Admin", "Admin Send Approved Reply with Email Dispatch", "POST", `/api/admin/tickets/${testTicketId}/send-reply`, {
    cookies: adminCookies,
    expectedStatus: 201,
    body: {
      content: "Dear Priya,\n\nWe have reconciled your accounts. The pending balance is scheduled for settlement.",
      status: "In Progress",
    },
    validate: (b) => b?.success === true,
  });

  await runTest("Admin", "Admin Patch Status to Resolved", "PATCH", `/api/admin/tickets/${testTicketId}`, {
    cookies: adminCookies,
    expectedStatus: 200,
    body: { status: "Resolved" },
    validate: (b) => b?.success === true && b?.ticket?.status === "Resolved",
  });

  await runTest("Admin", "Admin AI Assistant Simulation", "POST", "/api/admin/ai-assistant/simulate", {
    cookies: adminCookies,
    expectedStatus: 200,
    body: {
      author_id: "AUTH001",
      subject: "Royalty reconciliation question",
      description: "My royalties are pending.",
    },
    validate: (b) => b?.success === true && b?.result !== undefined,
  });

  // ---------------------------------------------------------------------------
  // 5. RBAC SECURITY & ROLE ISOLATION
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying RBAC Security Boundaries & Role Restrictions...");

  await runTest("Security", "Author Blocked from Admin Dashboard (403)", "GET", "/api/admin/dashboard", {
    cookies: authorCookies,
    expectedStatus: 403,
  });

  await runTest("Security", "Author Blocked from Admin Ticket Queue (403)", "GET", "/api/admin/tickets", {
    cookies: authorCookies,
    expectedStatus: 403,
  });

  await runTest("Security", "Author Blocked from Admin Assign (403)", "POST", `/api/admin/tickets/${testTicketId}/assign`, {
    cookies: authorCookies,
    body: { assigned_to: "Hacker" },
    expectedStatus: 403,
  });

  // ---------------------------------------------------------------------------
  // 6. PAYMENTS & RAZORPAY INTEGRATION
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying Razorpay Order & Payment Webhook Endpoints...");

  await runTest("Payment", "Create Razorpay Order", "POST", "/api/payment/razorpay/create-order", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: {
      planId: "standard",
      planName: "Standard Author Publishing Package",
      amount: 2499,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
    },
    validate: (b) => b?.success === true && b?.order?.orderId !== undefined,
  });

  await runTest("Payment", "Verify Razorpay Payment Signature (Malformed 400)", "POST", "/api/payment/razorpay/verify-payment", {
    cookies: authorCookies,
    expectedStatus: 400,
    body: { incomplete: true },
  });

  await runTest("Payment", "Razorpay Webhook (Missing Signature 400)", "POST", "/api/payment/razorpay/webhook", {
    expectedStatus: 400,
    body: { event: "payment.captured" },
  });

  // ---------------------------------------------------------------------------
  // 7. USER PROFILE & EMAIL ACTIVITY
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying User Profile & Notification Inbox...");

  await runTest("User", "Get User Profile", "GET", "/api/user/profile", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.user?.email === "priya.sharma@email.com",
  });

  await runTest("User", "Update User Profile (Sanitized PATCH)", "PATCH", "/api/user/profile", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: { city: "New Delhi, India" },
    validate: (b) => b?.success === true,
  });

  await runTest("Email", "Get Email Activity Inbox", "GET", "/api/email/inbox", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && Array.isArray(b?.emails),
  });

  await runTest("Email", "Dispatch Test Notification Email", "POST", "/api/email/send-test", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: { type: "LOGIN" },
    validate: (b) => b?.success === true,
  });

  // ---------------------------------------------------------------------------
  // 8. MEDIA UPLOADS & ATTACHMENTS
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying Media Upload (ImageKit) Endpoint...");

  await runTest("Upload", "Get ImageKit Client Auth Parameters", "GET", "/api/upload/imagekit", {
    cookies: authorCookies,
    expectedStatus: 200,
    validate: (b) => b?.success === true && b?.signature !== undefined,
  });

  await runTest("Upload", "Upload Attachment (Invalid Payload 400)", "POST", "/api/upload/imagekit", {
    cookies: authorCookies,
    expectedStatus: 400,
    body: { invalid: true },
  });

  // ---------------------------------------------------------------------------
  // 9. AI SERVICES & PUBLISHING CONCIERGE
  // ---------------------------------------------------------------------------
  console.log("▶ Verifying AI Assistant Routes & Deterministic Fallbacks...");

  await runTest("AI", "AI Concierge Chat (Nishtha)", "POST", "/api/ai/chat", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: { message: "What is BookLeaf's minimum payout threshold?" },
    validate: (b) => b?.success === true && typeof b?.reply === "string",
  });

  await runTest("AI", "AI Gemini Assistant", "POST", "/api/ai/gemini-assistant", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: { prompt: "How do ISBN barcodes get generated for paperback copies?" },
    validate: (b) => b?.success === true && typeof b?.response === "string",
  });

  await runTest("AI", "AI Instant Ticket Help Solution", "POST", "/api/ai/instant-ticket-help", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: {
      subject: "ISBN registration delay",
      description: "My ISBN is taking longer than expected.",
      category: "ISBN & Metadata Issues",
    },
    validate: (b) => b?.success === true && typeof b?.solution === "string",
  });

  await runTest("AI", "AI Marketing Suite Campaign Generator", "POST", "/api/ai/marketing", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: {
      bookTitle: "Whispers of the Monsoon",
      genre: "Poetry",
      blurb: "A journey through feelings and memories.",
    },
    validate: (b) => b?.success === true && b?.campaign !== undefined,
  });

  await runTest("AI", "AI Writing Studio Chapter Drafter", "POST", "/api/ai/write-book", {
    cookies: authorCookies,
    expectedStatus: 200,
    body: {
      action: "chapter",
      title: "The Silent Valley",
      genre: "Mystery",
      topic: "The discovery of a hidden diary.",
    },
    validate: (b) => b?.success === true && typeof b?.content === "string",
  });

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 API VERIFICATION SUMMARY REPORT");
  console.log("================================================================================\n");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  const categories = Array.from(new Set(results.map((r) => r.category)));

  for (const cat of categories) {
    const catResults = results.filter((r) => r.category === cat);
    const catPassed = catResults.filter((r) => r.passed).length;
    console.log(`\n📂 [${cat.toUpperCase()}] (${catPassed}/${catResults.length} Passed)`);
    console.log("--------------------------------------------------------------------------------");

    for (const r of catResults) {
      const statusIcon = r.passed ? "✅ PASS" : "❌ FAIL";
      const exp = Array.isArray(r.expectedStatus) ? r.expectedStatus.join("/") : r.expectedStatus;
      console.log(
        `${statusIcon.padEnd(8)} | ${r.method.padEnd(6)} | ${r.endpoint.padEnd(48)} | Code: ${String(r.receivedStatus).padEnd(3)} (Exp: ${exp}) | ${String(r.durationMs).padStart(4)}ms | ${r.name}`
      );
      if (!r.passed && r.notes) {
        console.log(`         ↳ Issue: ${r.notes}`);
      }
    }
  }

  console.log("\n================================================================================");
  console.log(`Total Endpoints Tested : ${total}`);
  console.log(`Successful Endpoints   : ${passed}`);
  console.log(`Failed Endpoints       : ${failed}`);
  console.log(`Success Pass Rate      : ${passRate}%`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});

export {};
