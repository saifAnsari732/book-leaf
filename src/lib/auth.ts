import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { SafeUser, UserRecord } from "@/types/domain";
import { isSessionRevoked, isTokenBlacklisted } from "./session-store";

export const SESSION_COOKIE_NAME = "bookleaf_session";
export const ACCESS_TOKEN_COOKIE_NAME = "bookleaf_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "bookleaf_refresh_token";

// Expiration timings
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.includes("dev-session-secret"))) {
    console.warn(
      "[SECURITY WARNING]: Production environment detected without a strong custom SESSION_SECRET configured. Please set SESSION_SECRET in production env."
    );
  }
  return new TextEncoder().encode(
    secret || "bookleaf-dev-session-secret-change-in-production-2026"
  );
}

function getRefreshSecretKey(): Uint8Array {
  const secret = process.env.REFRESH_SECRET || process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.includes("dev-refresh-secret"))) {
    console.warn(
      "[SECURITY WARNING]: Production environment detected without a strong custom REFRESH_SECRET configured."
    );
  }
  return new TextEncoder().encode(
    secret || "bookleaf-dev-refresh-secret-change-in-production-2026"
  );
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

// ============================================================================
// RBAC Token Generation (Access Token 15m & Refresh Token 7d)
// ============================================================================

/**
 * Creates a short-lived Access Token (15 minutes) for role-based API access.
 */
export async function createAccessToken(
  user: SafeUser,
  sessionId?: string
): Promise<string> {
  const claims: Record<string, unknown> = {
    user_id: user.user_id,
    author_id: user.author_id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    joined_date: user.joined_date,
    token_type: "access",
  };
  if (sessionId) {
    claims.sid = sessionId;
  }

  const jti = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecretKey());
}

/**
 * Creates a long-lived Refresh Token (7 days) for rotating access tokens.
 */
export async function createRefreshToken(
  user: SafeUser,
  sessionId?: string
): Promise<string> {
  const jti = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const claims: Record<string, unknown> = {
    user_id: user.user_id,
    author_id: user.author_id,
    email: user.email,
    role: user.role,
    token_type: "refresh",
  };
  if (sessionId) {
    claims.sid = sessionId;
  }

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecretKey());
}

/**
 * Dual token generator helper: returns both access and refresh tokens.
 */
export async function createAuthTokens(
  user: SafeUser,
  sessionId?: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(user, sessionId),
    createRefreshToken(user, sessionId),
  ]);
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
  };
}

/**
 * Legacy session token helper for backward compatibility (7 days).
 */
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
    token_type: "session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

// ============================================================================
// RBAC Token Verification
// ============================================================================

export async function verifyAccessToken(
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

    // Token revocation and session invalidation check
    if (typeof payload.jti === "string" && isTokenBlacklisted(payload.jti)) {
      return null;
    }
    if (
      typeof payload.sid === "string" &&
      (await isSessionRevoked(payload.sid))
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

export async function verifyRefreshToken(token: string): Promise<{
  user_id: string;
  author_id: string | null;
  email: string;
  role: "AUTHOR" | "ADMIN";
  sid?: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecretKey());
    if (
      typeof payload.user_id !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "AUTHOR" && payload.role !== "ADMIN")
    ) {
      return null;
    }

    if (typeof payload.jti === "string" && isTokenBlacklisted(payload.jti)) {
      return null;
    }
    if (
      typeof payload.sid === "string" &&
      (await isSessionRevoked(payload.sid))
    ) {
      return null;
    }

    return {
      user_id: payload.user_id,
      author_id:
        typeof payload.author_id === "string" ? payload.author_id : null,
      email: payload.email,
      role: payload.role,
      sid: typeof payload.sid === "string" ? payload.sid : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Verifies any valid token (Access Token, Session Token, or Header).
 */
export async function verifySessionToken(
  token: string
): Promise<SafeUser | null> {
  return verifyAccessToken(token);
}

/**
 * Retrieves the currently logged-in user from cookies or Authorization header.
 * Checks Access Token first, then legacy Session Token.
 */
export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = cookies();

    // 1. Check Access Token cookie
    const accessCookie = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    if (accessCookie) {
      const verified = await verifyAccessToken(accessCookie);
      if (verified) return verified;
    }

    // 2. Check legacy session cookie
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      const verified = await verifySessionToken(sessionCookie);
      if (verified) return verified;
    }

    // 3. Check Authorization header (Bearer <token>)
    const headerStore = headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      return verifyAccessToken(token);
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
    const access = req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    if (access) {
      const v = await verifyAccessToken(access);
      if (v) return v;
    }

    const c = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (c) {
      const v = await verifySessionToken(c);
      if (v) return v;
    }
  }

  if (req?.headers?.get) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      return verifyAccessToken(token);
    }
  }

  return getSessionUser();
}

// ============================================================================
// RBAC Authorization Helpers
// ============================================================================

export function requireRole(
  user: SafeUser | null,
  requiredRole: "AUTHOR" | "ADMIN"
): { authorized: boolean; reason?: string } {
  if (!user) {
    return { authorized: false, reason: "Authentication required" };
  }
  if (user.role !== requiredRole) {
    return {
      authorized: false,
      reason: `Access denied. ${requiredRole} role required (current: ${user.role})`,
    };
  }
  return { authorized: true };
}

export function canAccessAuthorResource(
  user: SafeUser | null,
  targetAuthorId: string
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true; // Admins have full oversight
  return user.role === "AUTHOR" && user.author_id === targetAuthorId;
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
