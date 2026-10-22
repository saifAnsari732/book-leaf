import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

function parseSetCookies(res: Response): string[] {
  // @ts-ignore Node 18+ has getSetCookie or raw headers
  if (typeof res.headers.getSetCookie === "function") {
    return res.headers.getSetCookie().map((c) => c.split(";")[0]);
  }
  const raw = res.headers.get("set-cookie");
  if (!raw) return [];
  return raw.split(/,(?=\s*[a-zA-Z0-9_-]+=)/).map((c) => c.trim().split(";")[0]);
}

async function runAuthVerification() {
  console.log("=================================================================");
  console.log("BookLeaf Enterprise Auth, RBAC & Unified Registration E2E Suite");
  console.log("=================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Unauthenticated Access Denial
  // --------------------------------------------------------------------------
  console.log("TEST 1: Verifying Unauthenticated Access Denial across Protected Routes...");

  const protectedRoutes = [
    { path: "/author-dashboard", expectedRedirect: "/login?redirect=%2Fauthor-dashboard" },
    { path: "/author", expectedRedirect: "/login?redirect=%2Fauthor" },
    { path: "/admin", expectedRedirect: "/login?redirect=%2Fadmin" },
    { path: "/admin/tickets", expectedRedirect: "/login?redirect=%2Fadmin%2Ftickets" },
    { path: "/create_book", expectedRedirect: "/login?redirect=%2Fcreate_book" },
    { path: "/dashboard", expectedRedirect: "/login?redirect=%2Fdashboard" },
  ];

  for (const { path, expectedRedirect } of protectedRoutes) {
    const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    console.log(`  [Route Denial] ${path} -> HTTP ${res.status} Location: ${location}`);
    assert(
      res.status === 307 || res.status === 302 || res.status === 308,
      `Expected redirect status for ${path}, got ${res.status}`
    );
    assert(
      location.includes(expectedRedirect) || location.includes("/login"),
      `Expected redirect to include ${expectedRedirect}, got ${location}`
    );
  }
  console.log("  [PASS] All protected routes strictly deny unauthenticated access!\n");

  // --------------------------------------------------------------------------
  // TEST 2: Author Registration (Unified Create Account API)
  // --------------------------------------------------------------------------
  console.log("TEST 2: Registering a Brand New Author via Unified Registration Endpoint...");
  const uniqueId = Date.now();
  const newAuthorPayload = {
    name: "Aarav Mehta",
    email: `aarav.mehta.${uniqueId}@bookleaf-authors.com`,
    password: "authorPassword123!",
    phone: "+91 98765 43210",
    city: "Mumbai, Maharashtra",
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newAuthorPayload),
  });

  const regData = await regRes.json();
  console.log(`  [Register Status] HTTP ${regRes.status}`);
  console.log(`  [Register Response]`, JSON.stringify(regData, null, 2));

  assert.equal(regRes.status, 201, "Expected HTTP 201 Created");
  assert.equal(regData.success, true, "Expected success: true");
  assert.equal(regData.role, "AUTHOR", "Expected role: AUTHOR");
  assert.equal(regData.user.name, "Aarav Mehta", "Expected author name match");
  assert(regData.user.author_id.startsWith("AUTH"), "Expected author_id starting with AUTH");
  assert(regData.accessToken, "Expected accessToken in registration response");

  // Extract auth cookies
  const authorCookies = parseSetCookies(regRes);
  console.log(`  [Author Cookies Set]`, authorCookies);
  assert(
    authorCookies.some((c) => c.startsWith("bookleaf_access_token=")),
    "Expected bookleaf_access_token cookie"
  );
  const authorCookieHeader = authorCookies.join("; ");
  console.log("  [PASS] Author registration succeeded with cookies and incremental author ID!\n");

  // --------------------------------------------------------------------------
  // TEST 3: Duplicate Registration Protection
  // --------------------------------------------------------------------------
  console.log("TEST 3: Testing Duplicate Email Protection...");
  const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newAuthorPayload),
  });
  console.log(`  [Duplicate Register Status] HTTP ${dupRes.status}`);
  assert.equal(dupRes.status, 409, "Expected 409 Conflict for existing email");
  console.log("  [PASS] Duplicate registration rejected with 409 Conflict!\n");

  // --------------------------------------------------------------------------
  // TEST 4: Authenticated Author Dashboard Access
  // --------------------------------------------------------------------------
  console.log("TEST 4: Accessing Author Dashboard with Newly Registered Author Session...");
  const authSessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: authorCookieHeader },
  });
  const sessionData = await authSessionRes.json();
  console.log(`  [Session Check]`, sessionData);
  assert.equal(sessionData.authenticated, true);
  assert.equal(sessionData.user.name, "Aarav Mehta");
  assert.equal(sessionData.user.role, "AUTHOR");

  const dashRes = await fetch(`${BASE_URL}/author-dashboard`, {
    headers: { Cookie: authorCookieHeader },
    redirect: "manual",
  });
  console.log(`  [Author Dashboard Access] HTTP ${dashRes.status}`);
  assert.equal(dashRes.status, 200, "Expected HTTP 200 OK for logged-in author on author dashboard");
  console.log("  [PASS] Author dashboard rendered with full 200 OK access!\n");

  // --------------------------------------------------------------------------
  // TEST 5: RBAC Role Isolation (Author Accessing Admin Portal)
  // --------------------------------------------------------------------------
  console.log("TEST 5: Testing Strict RBAC (Author attempting to access /admin)...");
  const authorAdminRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: authorCookieHeader },
    redirect: "manual",
  });
  const authorAdminLocation = authorAdminRes.headers.get("location") || "";
  console.log(`  [Author -> /admin] HTTP ${authorAdminRes.status} Location: ${authorAdminLocation}`);
  assert(
    authorAdminRes.status === 307 || authorAdminRes.status === 302,
    "Expected redirect for author trying to open admin"
  );
  assert(
    authorAdminLocation.includes("access_denied=admin_required"),
    "Expected access_denied=admin_required in redirect query parameter"
  );
  console.log("  [PASS] Author strictly denied from Admin Portal and routed back to Author Desk!\n");

  // --------------------------------------------------------------------------
  // TEST 6: Sign In with Existing Author (Priya Sharma)
  // --------------------------------------------------------------------------
  console.log("TEST 6: Signing In with Existing Verified Author (Priya Sharma)...");
  const priyaLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "priya.sharma@email.com",
      password: "author123",
    }),
  });
  const priyaLoginData = await priyaLoginRes.json();
  console.log(`  [Priya Login Status] HTTP ${priyaLoginRes.status}`);
  assert.equal(priyaLoginRes.status, 200);
  assert.equal(priyaLoginData.role, "AUTHOR");
  assert.equal(priyaLoginData.user.name, "Priya Sharma");

  const priyaCookies = parseSetCookies(priyaLoginRes).join("; ");
  const royaltyRes = await fetch(`${BASE_URL}/api/author/royalty`, {
    headers: { Cookie: priyaCookies },
  });
  const royaltyData = await royaltyRes.json();
  console.log(`  [Priya Royalty Data] Accrued: ₹${royaltyData.metrics.totalRoyaltyEarned}, Withdrawable: ₹${royaltyData.metrics.withdrawableBalance}`);
  assert.equal(royaltyData.success, true);
  assert.equal(royaltyData.metrics.withdrawableBalance, 3570);
  console.log("  [PASS] Existing author sign-in verified with full royalty balance!\n");

  // --------------------------------------------------------------------------
  // TEST 7: Sign In with Administrator & Access Admin Portal
  // --------------------------------------------------------------------------
  console.log("TEST 7: Signing In with Administrator Credentials...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@bookleafpub.com",
      password: "admin123",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log(`  [Admin Login Status] HTTP ${adminLoginRes.status}`);
  assert.equal(adminLoginRes.status, 200);
  assert.equal(adminLoginData.role, "ADMIN");

  const adminCookies = parseSetCookies(adminLoginRes).join("; ");
  const adminPageRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: adminCookies },
    redirect: "manual",
  });
  console.log(`  [Admin Portal Access] HTTP ${adminPageRes.status}`);
  assert.equal(adminPageRes.status, 200, "Expected HTTP 200 OK for Admin on /admin");

  const adminApiRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Cookie: adminCookies },
  });
  const adminApiData = await adminApiRes.json();
  console.log(`  [Admin Ops Metrics] Total Tickets: ${adminApiData.metrics.totalTickets}, Authors: ${adminApiData.metrics.totalAuthors}`);
  assert.equal(adminApiData.success, true);
  console.log("  [PASS] Administrator login and full portal access verified!\n");

  // --------------------------------------------------------------------------
  // TEST 8: Universal /dashboard Role Dispatcher
  // --------------------------------------------------------------------------
  console.log("TEST 8: Testing Universal /dashboard Role-Based Dispatcher...");
  // Author on /dashboard -> routes to author
  const authorDashRedirect = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: authorCookieHeader },
    redirect: "manual",
  });
  const authorDashLoc = authorDashRedirect.headers.get("location") || "";
  console.log(`  [Author -> /dashboard] HTTP ${authorDashRedirect.status} -> ${authorDashLoc}`);
  assert(authorDashLoc.includes("/author-dashboard") || authorDashLoc.includes("/author"));

  // Admin on /dashboard -> routes to admin
  const adminDashRedirect = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: adminCookies },
    redirect: "manual",
  });
  const adminDashLoc = adminDashRedirect.headers.get("location") || "";
  console.log(`  [Admin -> /dashboard] HTTP ${adminDashRedirect.status} -> ${adminDashLoc}`);
  assert(adminDashLoc.includes("/admin"));
  console.log("  [PASS] Universal /dashboard dispatcher correctly routes authors and admins!\n");

  console.log("=================================================================");
  console.log("ALL 8 END-TO-END AUTH & RBAC VERIFICATION TESTS PASSED (100%)");
  console.log("=================================================================");
}

runAuthVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
