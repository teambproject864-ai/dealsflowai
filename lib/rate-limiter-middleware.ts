// lib/rate-limiter-middleware.ts
import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextResponse } from "next/server";
import { db } from "./firebase-admin";

let sensitiveRouteLimiter: RateLimiterMemory;
let loginLockoutLimiter: RateLimiterMemory;
let captchaTriggerLimiter: RateLimiterMemory;

// Initialize rate limiters
function initializeRateLimiters() {
    // Always use in-memory for now (rate-limiter-flexible doesn't have a built-in Firestore adapter
    sensitiveRouteLimiter = new RateLimiterMemory({
      points: 20,
      duration: 60,
    });

    loginLockoutLimiter = new RateLimiterMemory({
      points: 5,
      duration: 900,
    });

    captchaTriggerLimiter = new RateLimiterMemory({
      points: 3,
      duration: 900,
    });

    console.log("⚠️ Rate limiters initialized with in-memory (non-persistent)");
}

// Initialize on first import
initializeRateLimiters();

function getClientIp(req: Request): string {
  let ip = "127.0.0.1";
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    ip = forwardedFor.split(",")[0].trim();
  }
  return ip;
}

/**
 * Checks rate limit for sensitive routes.
 * If rate limit is exceeded, returns a 429 NextResponse with a Retry-After header.
 * Otherwise, returns null, meaning the request is allowed to proceed.
 */
export async function checkRateLimitSensitive(req: Request): Promise<NextResponse | null> {
  try {
    const ip = getClientIp(req);
    await sensitiveRouteLimiter.consume(ip, 1);
    return null;
  } catch (rej: any) {
    const headers = new Headers();
    const msBeforeNext = rej.msBeforeNext || 1000;
    headers.set("Retry-After", Math.ceil(msBeforeNext / 1000).toString());
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later" },
      { status: 429, headers }
    );
  }
}

// Export the login rate limiters for use in the login route
export { loginLockoutLimiter, captchaTriggerLimiter };
