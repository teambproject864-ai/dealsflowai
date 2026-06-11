import { RateLimiterMemory } from 'rate-limiter-flexible';

// Configure rate limiter: 10 requests per minute per IP
export const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

export async function checkRateLimit(req: Request): Promise<{ allowed: boolean; remainingPoints?: number; msBeforeNext?: number }> {
  try {
    // Get client IP (for Next.js API routes
    let ip = "127.0.0.1";
    // Try to get IP from headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      ip = forwardedFor.split(",")[0].trim();
    } else {
      // Fallback to a default if we can't get the real IP
      ip = "unknown";
    }

    const result = await rateLimiter.consume(ip);
    return {
      allowed: true,
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
    };
  } catch (error) {
    // Check if it's a rate-limiter-flexible error (exceeded points)
    if (
      typeof error === "object" &&
      error !== null &&
      "msBeforeNext" in error &&
      "remainingPoints" in error
    ) {
      return {
        allowed: false,
        remainingPoints: (error as any).remainingPoints,
        msBeforeNext: (error as any).msBeforeNext,
      };
    }
    // If it's any other error, just return not allowed
    console.error("[Rate Limiter] Unexpected error:", error);
    return { allowed: false };
  }
}
