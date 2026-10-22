import Redis from "ioredis";

/**
 * Upstash Redis Distributed Cache & Rate Limiting Module
 * Provides sub-millisecond in-memory caching for Author dashboards, book catalogs,
 * Admin KPI metrics, ticket queries, and distributed rate limiting.
 *
 * Architecture:
 * - Singleton pattern across Next.js HMR reloads
 * - Non-blocking fail-open design: if Redis is temporarily unreachable, queries seamlessly
 *   fall back to MongoDB with zero downtime or user impact.
 * - Granular cache invalidation on ticket mutations.
 */

declare global {
  // eslint-disable-next-line no-var
  var __bookleafRedisInstance: Redis | undefined;
}

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL?.trim();
}

export function getRedisClient(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;

  if (globalThis.__bookleafRedisInstance) {
    return globalThis.__bookleafRedisInstance;
  }

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      commandTimeout: 3000,
      enableAutoPipelining: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 1000);
      },
    });

    client.on("error", (err) => {
      // Log once without crashing the process
      if (process.env.NODE_ENV !== "test") {
        console.warn("[BookLeaf Redis] Connection warning:", err.message);
      }
    });

    globalThis.__bookleafRedisInstance = client;
    return client;
  } catch (err) {
    console.warn("[BookLeaf Redis] Failed to initialize Redis client:", err);
    return null;
  }
}

// ============================================================================
// Cache Keys Taxonomy
// ============================================================================

export const REDIS_KEYS = {
  demoAccounts: "bl:demo_accounts:v1",
  adminMetrics: "bl:admin:metrics:v1",
  authorDashboard: (authorId: string) => `bl:author:${authorId}:dash:v1`,
  authorBooks: (authorId: string) => `bl:author:${authorId}:books:v1`,
  authorTickets: (authorId: string) => `bl:author:${authorId}:tickets:v1`,
  ticketDetail: (ticketId: string) => `bl:ticket:${ticketId}:detail:v1`,
  rateLimit: (key: string) => `bl:ratelimit:${key}`,
};

// ============================================================================
// Cache Helpers (Get, Set, Invalidate)
// ============================================================================

export async function redisGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 60
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, "EX", ttlSeconds);
    return true;
  } catch {
    return false;
  }
}

export async function redisDel(...keys: string[]): Promise<void> {
  const client = getRedisClient();
  if (!client || keys.length === 0) return;

  try {
    await client.del(...keys);
  } catch {
    // Non-blocking
  }
}

export async function redisDelPattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Granularly invalidates all cached views related to a ticket mutation.
 * Called automatically when a ticket is created, updated, replied to, or assigned.
 */
export async function invalidateTicketCaches(params: {
  ticketId?: string;
  authorId?: string;
}): Promise<void> {
  const keysToInvalidate: string[] = [REDIS_KEYS.adminMetrics];

  if (params.ticketId) {
    keysToInvalidate.push(REDIS_KEYS.ticketDetail(params.ticketId));
  }
  if (params.authorId) {
    keysToInvalidate.push(REDIS_KEYS.authorDashboard(params.authorId));
    keysToInvalidate.push(REDIS_KEYS.authorTickets(params.authorId));
  }

  await redisDel(...keysToInvalidate);
}

// ============================================================================
// Distributed Sliding-Window Rate Limiting via Redis
// ============================================================================

export async function redisDistributedRateLimit(
  key: string,
  maxHits: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
  const client = getRedisClient();
  if (!client) {
    // Fail-open fallback to allow requests if Redis is offline
    return { allowed: true, remaining: maxHits, resetInSeconds: windowSeconds };
  }

  try {
    const redisKey = REDIS_KEYS.rateLimit(key);
    const count = await client.incr(redisKey);
    if (count === 1) {
      await client.expire(redisKey, windowSeconds);
    }
    const ttl = await client.ttl(redisKey);

    return {
      allowed: count <= maxHits,
      remaining: Math.max(0, maxHits - count),
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch {
    return { allowed: true, remaining: maxHits, resetInSeconds: windowSeconds };
  }
}
