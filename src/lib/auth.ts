import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { SafeUser, UserRecord } from "@/types/domain";

export const SESSION_COOKIE_NAME = "bookleaf_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ||
    "bookleaf-dev-session-secret-change-in-production-2026";
  return new TextEncoder().encode(secret);
}

export function toSafeUser(user: UserRecord): SafeUser {
  return {
    user_id: user.user_id,
    author_id: user.author_id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    joined_date: user.joined_date,
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(user: SafeUser): Promise<string> {
  return new SignJWT({
    user_id: user.user_id,
    author_id: user.author_id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    joined_date: user.joined_date,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SafeUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.user_id !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "AUTHOR" && payload.role !== "ADMIN")
    ) {
      return null;
    }
    return {
      user_id: payload.user_id,
      author_id:
        typeof payload.author_id === "string" ? payload.author_id : null,
      name: typeof payload.name === "string" ? payload.name : payload.email,
      email: payload.email,
      role: payload.role,
      phone: typeof payload.phone === "string" ? payload.phone : null,
      city: typeof payload.city === "string" ? payload.city : null,
      joined_date:
        typeof payload.joined_date === "string" ? payload.joined_date : null,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (tokenCookie) {
      const verified = await verifySessionToken(tokenCookie);
      if (verified) return verified;
    }

    const headerStore = headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      return verifySessionToken(token);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromRequest(
  req?: any
): Promise<SafeUser | null> {
  if (req?.cookies?.get) {
    const c = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (c) {
      const v = await verifySessionToken(c);
      if (v) return v;
    }
  }
  return getSessionUser();
}

// ============================================================================
// In-Memory Sliding Window Rate Limiter (for Login & Sensitive AI Endpoints)
// ============================================================================
interface RateBucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateBucket>();

export function checkRateLimit(
  key: string,
  maxRequests = 15,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(key) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] || now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000)
    );
    rateLimitStore.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  rateLimitStore.set(key, bucket);
  return {
    allowed: true,
    remaining: maxRequests - bucket.timestamps.length,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
