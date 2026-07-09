import { RateLimiterMemory } from "rate-limiter-flexible";

const defaultLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

const saveLeadLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

const consentLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

const analyzeLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

function getClientIp(req: Request): string {
  let ip = "127.0.0.1";
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    ip = forwardedFor.split(",")[0].trim();
  }
  return ip;
}

export async function checkRateLimit(req: Request): Promise<{ allowed: boolean; remainingPoints?: number; msBeforeNext?: number }> {
  try {
    const ip = getClientIp(req);
    const res = await defaultLimiter.consume(ip, 1);
    return {
      allowed: true,
      remainingPoints: res.remainingPoints,
      msBeforeNext: 0,
    };
  } catch (rej: any) {
    return {
      allowed: false,
      remainingPoints: 0,
      msBeforeNext: rej.msBeforeNext || 1000,
    };
  }
}

export async function checkRateLimitByRoute(
  req: Request,
  route: 'leads/save' | 'consent' | 'analyze'
): Promise<{ allowed: boolean; remainingPoints?: number; msBeforeNext?: number }> {
  try {
    const ip = getClientIp(req);
    let limiter: RateLimiterMemory;
    if (route === 'leads/save') {
      limiter = saveLeadLimiter;
    } else if (route === 'consent') {
      limiter = consentLimiter;
    } else {
      limiter = analyzeLimiter;
    }

    const res = await limiter.consume(ip, 1);
    return {
      allowed: true,
      remainingPoints: res.remainingPoints,
      msBeforeNext: 0,
    };
  } catch (rej: any) {
    return {
      allowed: false,
      remainingPoints: 0,
      msBeforeNext: rej.msBeforeNext || 1000,
    };
  }
}
