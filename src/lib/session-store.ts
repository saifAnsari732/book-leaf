import { redisGet, redisSet, redisDel } from "./redis";

export interface ActiveSessionRecord {
  session_id: string;
  user_id: string;
  author_id: string | null;
  email: string;
  role: "AUTHOR" | "ADMIN";
  ip_address: string;
  user_agent: string;
  device_label: string;
  created_at: string;
  last_active_at: string;
  expires_at: string;
  is_revoked: boolean;
}

export interface UserSessionView extends ActiveSessionRecord {
  is_current: boolean;
}

// In-Memory store for sessions and token blacklists
const activeSessions = new Map<string, ActiveSessionRecord>();
const blacklistedTokens = new Set<string>();

/**
 * Parses user agent string to friendly device label
 */
export function parseDeviceLabel(ua: string): string {
  if (!ua) return "Unknown Device";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows PC";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("iPhone")) os = "iPhone";
  else if (ua.includes("iPad")) os = "iPad";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Linux")) os = "Linux";

  let browser = "Browser";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/") && !ua.includes("Edg/")) browser = "Chrome";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";
  else if (ua.includes("Firefox/")) browser = "Firefox";

  return `${browser} on ${os}`;
}

/**
 * Registers a new active session
 */
export async function registerSession(params: {
  sessionId?: string;
  userId: string;
  authorId?: string | null;
  email: string;
  role: "AUTHOR" | "ADMIN";
  ip: string;
  userAgent: string;
  ttlSeconds?: number;
}): Promise<ActiveSessionRecord> {
  const sessionId =
    params.sessionId ||
    `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();
  const ttl = params.ttlSeconds || 7 * 24 * 60 * 60; // 7 days default
  const expiresAt = new Date(now.getTime() + ttl * 1000).toISOString();

  const session: ActiveSessionRecord = {
    session_id: sessionId,
    user_id: params.userId,
    author_id: params.authorId || null,
    email: params.email,
    role: params.role,
    ip_address: params.ip,
    user_agent: params.userAgent,
    device_label: parseDeviceLabel(params.userAgent),
    created_at: now.toISOString(),
    last_active_at: now.toISOString(),
    expires_at: expiresAt,
    is_revoked: false,
  };

  activeSessions.set(sessionId, session);

  // Sync to Redis if available
  await redisSet(`bl:session:${sessionId}`, session, ttl);

  return session;
}

/**
 * Touches a session to update its last_active_at timestamp
 */
export async function touchSession(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (session && !session.is_revoked) {
    session.last_active_at = new Date().toISOString();
    activeSessions.set(sessionId, session);
    await redisSet(`bl:session:${sessionId}`, session, 7 * 24 * 60 * 60);
  }
}

/**
 * Checks whether a session ID is revoked or expired
 */
export async function isSessionRevoked(sessionId: string): Promise<boolean> {
  if (blacklistedTokens.has(sessionId)) {
    return true;
  }

  // Check in-memory map
  const memSession = activeSessions.get(sessionId);
  if (memSession) {
    if (memSession.is_revoked) return true;
    if (new Date(memSession.expires_at) < new Date()) return true;
    return false;
  }

  // Check Redis
  const redisSession = await redisGet<ActiveSessionRecord>(
    `bl:session:${sessionId}`
  );
  if (redisSession) {
    if (redisSession.is_revoked) return true;
    if (new Date(redisSession.expires_at) < new Date()) return true;
    activeSessions.set(sessionId, redisSession);
    return false;
  }

  // If session is unknown in strict session tracking mode, consider valid unless blacklisted
  return false;
}

/**
 * Checks whether a session ID is currently active and not revoked/expired
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const revoked = await isSessionRevoked(sessionId);
  return !revoked;
}

/**
 * Revokes a specific session
 */
export async function revokeSession(
  sessionId: string,
  userId?: string
): Promise<boolean> {
  blacklistedTokens.add(sessionId);

  const session = activeSessions.get(sessionId);
  if (session) {
    if (userId && session.user_id !== userId) {
      return false; // Unauthorized revocation attempt
    }
    session.is_revoked = true;
    activeSessions.set(sessionId, session);
  }

  await redisDel(`bl:session:${sessionId}`);
  await redisSet(`bl:revoked:${sessionId}`, true, 7 * 24 * 60 * 60);
  return true;
}

/**
 * Revokes all sessions for a user except the current session
 */
export async function revokeAllOtherSessions(
  userId: string,
  currentSessionId?: string
): Promise<number> {
  let count = 0;

  for (const [id, session] of Array.from(activeSessions.entries())) {
    if (session.user_id === userId && id !== currentSessionId) {
      session.is_revoked = true;
      blacklistedTokens.add(id);
      activeSessions.set(id, session);
      await redisDel(`bl:session:${id}`);
      await redisSet(`bl:revoked:${id}`, true, 7 * 24 * 60 * 60);
      count++;
    }
  }

  return count;
}

/**
 * Retrieves all active, non-revoked sessions for a specific user
 */
export async function getUserActiveSessions(
  userId: string,
  currentSessionId?: string
): Promise<UserSessionView[]> {
  const results: UserSessionView[] = [];
  const now = new Date();

  for (const session of Array.from(activeSessions.values())) {
    if (
      session.user_id === userId &&
      !session.is_revoked &&
      new Date(session.expires_at) > now
    ) {
      results.push({
        ...session,
        is_current: session.session_id === currentSessionId,
      });
    }
  }

  // Sort descending by last_active_at
  return results.sort(
    (a, b) =>
      new Date(b.last_active_at).getTime() -
      new Date(a.last_active_at).getTime()
  );
}

/**
 * Blacklists a JWT token by JTI
 */
export function blacklistToken(jti: string): void {
  blacklistedTokens.add(jti);
}

/**
 * Checks if a JWT JTI is blacklisted
 */
export function isTokenBlacklisted(jti: string): boolean {
  return blacklistedTokens.has(jti);
}
