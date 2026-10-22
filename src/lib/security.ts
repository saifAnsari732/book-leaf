import { NextRequest, NextResponse } from "next/server";

/**
 * Enterprise Security Suite: Helmet-Grade Headers, CSRF/Origin Protection & Input Sanitization
 */

export interface SecurityHeadersConfig {
  enableCsp?: boolean;
  enableHsts?: boolean;
  enableCors?: boolean;
  allowedOrigins?: string[];
}

/**
 * Standard HTTP Security Headers (Helmet Equivalent for Next.js)
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME-sniffing
  "X-Content-Type-Options": "nosniff",

  // Clickjacking protection: only allow same origin to frame
  "X-Frame-Options": "SAMEORIGIN",

  // Legacy XSS filter protection
  "X-XSS-Protection": "1; mode=block",

  // Referrer policy: send full URL on same-origin, domain-only on cross-origin HTTPS
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Strict Transport Security (HSTS): Enforce HTTPS for 2 years including subdomains
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

  // Feature / Permissions Policy: Disable invasive browser APIs by default
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self 'https://checkout.razorpay.com')",

  // Cross-Origin Opener Policy: Allow popups for Razorpay payment window
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",

  // Cross-Origin Resource Policy: Restrict resources to same-origin
  "Cross-Origin-Resource-Policy": "same-origin",

  // Restrict Flash / PDF cross-domain policy files
  "X-Permitted-Cross-Domain-Policies": "none",

  // DNS prefetch control
  "X-DNS-Prefetch-Control": "on",
};

/**
 * Content Security Policy Directive Builder
 */
export function buildCspHeader(): string {
  const directives = [
    "default-src 'self'",
    // Scripts: Self, inline scripts for Next.js hydration, eval for dev/react, Razorpay, ImageKit
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://*.imagekit.io",
    // Styles: Self, unsafe-inline for Tailwind/CSS-in-JS, Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Images: Self, data URIs, ImageKit CDN, YouTube thumbnails, Unsplash
    "img-src 'self' data: blob: https://ik.imagekit.io https://i.ytimg.com https://images.unsplash.com https://*.razorpay.com",
    // Fonts: Self, Google Fonts, data URIs
    "font-src 'self' data: https://fonts.gstatic.com",
    // API & WebSockets connections: Self, Razorpay APIs, Gemini API, ImageKit
    "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://generativelanguage.googleapis.com https://upload.imagekit.io",
    // Frames: Razorpay checkout modal, YouTube video embeds
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.youtube.com https://www.youtube-nocookie.com",
    // Frame ancestors: SAMEORIGIN
    "frame-ancestors 'self'",
    // Objects: Disallow plugins
    "object-src 'none'",
    // Base URI
    "base-uri 'self'",
    // Form action
    "form-action 'self'",
  ];

  if (process.env.NODE_ENV === "production") {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

/**
 * Applies all Helmet-grade security headers to an existing NextResponse
 */
export function applySecurityHeaders(
  response: NextResponse,
  options?: { isApiRoute?: boolean }
): NextResponse {
  // Apply core security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Apply CSP header
  response.headers.set("Content-Security-Policy", buildCspHeader());

  // Prevent caching of sensitive API responses
  if (options?.isApiRoute) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

/**
 * Validates Origin and Referer headers for mutating requests (CSRF protection)
 */
export function validateCsrfOrigin(req: NextRequest): {
  valid: boolean;
  reason?: string;
} {
  const method = req.method.toUpperCase();

  // Safe HTTP methods don't mutate state
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  // Exempt webhooks that use HMAC signatures (e.g., Razorpay webhook)
  const pathname = req.nextUrl.pathname;
  if (pathname.includes("/webhook")) {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host")?.trim();

  // In test or non-browser server-to-server environments where origin is omitted, allow
  if (!origin && !referer) {
    return { valid: true };
  }

  const isHostMatch = (actualHost: string, expectedHost: string) => {
    if (actualHost.toLowerCase() === expectedHost.toLowerCase()) return true;
    const [actDomain] = actualHost.split(":");
    const [expDomain] = expectedHost.split(":");
    return actDomain.toLowerCase() === expDomain.toLowerCase();
  };

  try {
    if (origin) {
      const originHost = new URL(origin).host;
      if (host && !isHostMatch(originHost, host)) {
        return {
          valid: false,
          reason: `Cross-site request blocked: Origin '${originHost}' does not match host '${host}'`,
        };
      }
    } else if (referer) {
      const refererHost = new URL(referer).host;
      if (host && !isHostMatch(refererHost, host)) {
        return {
          valid: false,
          reason: `Cross-site request blocked: Referer '${refererHost}' does not match host '${host}'`,
        };
      }
    }
  } catch {
    return { valid: false, reason: "Malformed Origin or Referer header" };
  }

  return { valid: true };
}

/**
 * NoSQL Injection Sanitizer: Recursively strips keys starting with '$' or containing '.'
 */
export function sanitizeNoSql<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeNoSql(item)) as unknown as T;
  }

  const cleanObj: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    // Drop keys starting with '$' or containing '.'
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    // Drop fields containing operator injection objects (e.g. { $gt: "" }, { $ne: null })
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      const subKeys = Object.keys(val);
      if (subKeys.some((k) => k.startsWith("$"))) {
        continue;
      }
    }

    cleanObj[key] = sanitizeNoSql(val);
  }

  return cleanObj as T;
}

/**
 * XSS String Sanitizer: Strips hazardous HTML tags and JS schemes
 */
export function sanitizeXss(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}
