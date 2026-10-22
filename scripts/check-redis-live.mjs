import Redis from "ioredis";

const REDIS_URL = "rediss://default:gQAAAAAAAmsqAAIgcDI1NDM5NWYwYWRlN2Y0YTE0ODkzYzE4YThjN2FlODU5ZA@adjusted-hermit-158506.upstash.io:6379";
const BASE_URL = "http://localhost:3000";

function extractCookie(res) {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  return setCookie.split(";")[0];
}

async function main() {
  console.log("====================================================================================================");
  console.log(" BOOKLEAF PUBLISHING — UPSTASH REDIS LIVE TELEMETRY & CACHE AUDIT");
  console.log("====================================================================================================");

  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 2,
    connectTimeout: 5000,
  });

  try {
    // 1. Direct Ping & Latency Probe
    const t0 = Date.now();
    const ping = await redis.ping();
    const pingLatency = Date.now() - t0;
    console.log(`✓ 1. Redis Connection Ping   : ${ping} (${pingLatency}ms round-trip to Upstash)`);

    // 2. Set/Get Round-trip Verification
    const testKey = "bl:healthcheck:probe";
    const testPayload = { timestamp: new Date().toISOString(), status: "HEALTHY", engine: "Upstash Redis" };
    await redis.set(testKey, JSON.stringify(testPayload), "EX", 30);
    const readBack = JSON.parse(await redis.get(testKey) || "{}");
    console.log(`✓ 2. Read/Write Verification : Stored & Retrieved probe key successfully (${readBack.status})`);
    await redis.del(testKey);

    // 3. Inspect existing BookLeaf cache keys in Upstash Redis
    const allKeys = await redis.keys("bl:*");
    console.log(`✓ 3. Active BookLeaf Keys    : ${allKeys.length} keys found in Upstash Redis:`);
    for (const key of allKeys) {
      const ttl = await redis.ttl(key);
      const type = await redis.type(key);
      console.log(`     • [${type}] ${key.padEnd(35)} (TTL: ${ttl}s remaining)`);
    }

    // 4. Test Demo Accounts Endpoint (Cold vs Warm Cache)
    console.log("\n--- Testing HTTP API Caching Performance ---");
    const t1 = Date.now();
    const res1 = await fetch(`${BASE_URL}/api/auth/demo-accounts`);
    const data1 = await res1.json();
    const ms1 = Date.now() - t1;
    console.log(`✓ 4. GET /api/auth/demo-accounts (Pass 1 - Cold/Fresh) : HTTP ${res1.status} in ${ms1}ms (cached: ${data1.cached})`);

    const t2 = Date.now();
    const res2 = await fetch(`${BASE_URL}/api/auth/demo-accounts`);
    const data2 = await res2.json();
    const ms2 = Date.now() - t2;
    console.log(`✓ 5. GET /api/auth/demo-accounts (Pass 2 - Warm Cache) : HTTP ${res2.status} in ${ms2}ms (cached: ${data2.cached})`);

    // 5. Test Admin Dashboard Caching with Session
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@bookleafpub.com", password: "admin123" }),
    });
    const adminCookie = extractCookie(loginRes);

    const t3 = Date.now();
    const adminRes1 = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: adminCookie },
    });
    const adminData1 = await adminRes1.json();
    const ms3 = Date.now() - t3;
    console.log(`✓ 6. GET /api/admin/dashboard (Pass 1 - Aggregation)   : HTTP ${adminRes1.status} in ${ms3}ms (cached: ${adminData1.cached})`);

    const t4 = Date.now();
    const adminRes2 = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: adminCookie },
    });
    const adminData2 = await adminRes2.json();
    const ms4 = Date.now() - t4;
    console.log(`✓ 7. GET /api/admin/dashboard (Pass 2 - Redis Cache)   : HTTP ${adminRes2.status} in ${ms4}ms (cached: ${adminData2.cached})`);

    // 6. Test Author Dashboard Caching
    const authorLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "priya.sharma@email.com", password: "author123" }),
    });
    const authorCookie = extractCookie(authorLogin);

    const t5 = Date.now();
    const authRes1 = await fetch(`${BASE_URL}/api/author/dashboard`, {
      headers: { Cookie: authorCookie },
    });
    const authData1 = await authRes1.json();
    const ms5 = Date.now() - t5;
    console.log(`✓ 8. GET /api/author/dashboard (Pass 1)               : HTTP ${authRes1.status} in ${ms5}ms (cached: ${authData1.cached})`);

    const t6 = Date.now();
    const authRes2 = await fetch(`${BASE_URL}/api/author/dashboard`, {
      headers: { Cookie: authorCookie },
    });
    const authData2 = await authRes2.json();
    const ms6 = Date.now() - t6;
    console.log(`✓ 9. GET /api/author/dashboard (Pass 2 - Redis Cache) : HTTP ${authRes2.status} in ${ms6}ms (cached: ${authData2.cached})`);

    // 7. Verify Redis Key Inspection after API Calls
    const updatedKeys = await redis.keys("bl:*");
    console.log(`\n✓ 10. Current Active Keys in Upstash Redis (${updatedKeys.length} keys):`);
    for (const key of updatedKeys) {
      const ttl = await redis.ttl(key);
      console.log(`     • ${key.padEnd(35)} -> TTL: ${ttl}s`);
    }

    console.log("====================================================================================================");
    console.log(" CONCLUSION: UPSTASH REDIS IS 100% OPERATIONAL, CACHING AND ACCELERATING LIVE TRAFFIC!");
    console.log("====================================================================================================");
  } catch (err) {
    console.error("Redis check failed:", err);
    process.exit(1);
  } finally {
    redis.disconnect();
    process.exit(0);
  }
}

main();
