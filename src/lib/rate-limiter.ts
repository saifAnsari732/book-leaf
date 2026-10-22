import { NextRequest, NextResponse } from "next/server";
import { getRedisClient, REDIS_KEYS } from "./redis";

export type RateLimitPreset =
  | "login"
  | "register"
  | "auth"
  | "ai"
  | "payment"
  | "tickets"
  | "email"
  | "globalApi";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMIT_PRESETS: Record<RateLimitPreset, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 60_000 }, // 5 attempts per minute (brute-force defense)
  register: { maxRequests: 5, windowMs: 60_000 },
  auth: { maxRequests: 30, windowMs: 60_000 },
  ai: { maxRequests: 20, windowMs: 60_000 },
  payment: { maxRequests: 15, windowMs: 60_000 },
  tickets: { maxRequests: 30, windowMs: 60_000 },
  email: { maxRequests: 10, windowMs: 60_000 },
  globalApi: { maxRequests: 120, windowMs: 60_000 },
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  retryAfterSeconds: number;
  headers: Record<string, string>;
}

// In-Memory sliding-window fallback store
interface MemoryBucket {
  timestamps: number[];
}
const memoryRateLimitStore = new Map<string, MemoryBucket>();

export function clearMemoryRateLimitStore(): void {
  memoryRateLimitStore.clear();
}

/**
 * Extracts best-effort client IP from incoming NextRequest
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Core rate limit evaluator: Redis distributed with In-Memory fallback
 */
export async function evaluateRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs } = config;
  const windowSeconds = Math.ceil(windowMs / 1000);
  const now = Date.now();

  const client = getRedisClient();

  if (client) {
    try {
      const redisKey = REDIS_KEYS.rateLimit(key);
      const count = await client.incr(redisKey);
      if (count === 1) {
        await client.expire(redisKey, windowSeconds);
      }
      const ttl = await client.ttl(redisKey);
      const resetInSeconds = ttl > 0 ? ttl : windowSeconds;
      const allowed = count <= maxRequests;
      const remaining = Math.max(0, maxRequests - count);
      const retryAfterSeconds = allowed ? 0 : resetInSeconds;

      const headers: Record<string, string> = {
        "RateLimit-Limit": String(maxRequests),
        "RateLimit-Remaining": String(remaining),
        "RateLimit-Reset": String(resetInSeconds),
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(resetInSeconds),
      };

      if (!allowed) {
        headers["Retry-After"] = String(retryAfterSeconds);
      }

      return {
        allowed,
        limit: maxRequests,
        remaining,
        resetInSeconds,
        retryAfterSeconds,
        headers,
      };
    } catch {
      // If Redis fails mid-operation, fall through to in-memory sliding window
    }
  }

  // In-memory sliding window
  const bucket = memoryRateLimitStore.get(key) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] || now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000)
    );

    memoryRateLimitStore.set(key, bucket);

    const headers: Record<string, string> = {
      "RateLimit-Limit": String(maxRequests),
      "RateLimit-Remaining": "0",
      "RateLimit-Reset": String(retryAfterSeconds),
      "X-RateLimit-Limit": String(maxRequests),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(retryAfterSeconds),
      "Retry-After": String(retryAfterSeconds),
    };

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetInSeconds: retryAfterSeconds,
      retryAfterSeconds,
      headers,
    };
  }

  bucket.timestamps.push(now);
  memoryRateLimitStore.set(key, bucket);

  const remaining = maxRequests - bucket.timestamps.length;
  const resetInSeconds = windowSeconds;

  const headers: Record<string, string> = {
    "RateLimit-Limit": String(maxRequests),
    "RateLimit-Remaining": String(remaining),
    "RateLimit-Reset": String(resetInSeconds),
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetInSeconds),
  };

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetInSeconds,
    retryAfterSeconds: 0,
    headers,
  };
}

/**
 * Convenience helper to enforce rate limit inside Next.js Route Handlers.
 * Returns null if allowed (and attaches headers), or a 429 NextResponse if rate limited.
 */
export async function enforceRateLimit(
  req: NextRequest,
  preset: RateLimitPreset,
  customKeySuffix?: string
): Promise<{ errorResponse: NextResponse | null; result: RateLimitResult }> {
  const ip = getClientIp(req);
  const config = RATE_LIMIT_PRESETS[preset];
  const key = `${preset}:${ip}${customKeySuffix ? `:${customKeySuffix}` : ""}`;

  const result = await evaluateRateLimit(key, config);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded for ${preset}. Please wait ${result.retryAfterSeconds} seconds before retrying.`,
        retryAfterSeconds: result.retryAfterSeconds,
      },
      { status: 429 }
    );

    for (const [header, val] of Object.entries(result.headers)) {
      response.headers.set(header, val);
    }

    return { errorResponse: response, result };
  }

  return { errorResponse: null, result };
}
