type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function createRateLimiter({ limit, windowMs }: RateLimitOptions) {
  const buckets = new Map<string, RateLimitBucket>();

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        const resetAt = now + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: Math.max(0, limit - 1), resetAt };
      }

      if (bucket.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
      }

      bucket.count += 1;
      return { allowed: true, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
    },
    reset() {
      buckets.clear();
    },
  };
}

const globalLimiters = globalThis as unknown as {
  syncXmlAuthLimiter?: ReturnType<typeof createRateLimiter>;
  syncXmlSensitiveLimiter?: ReturnType<typeof createRateLimiter>;
};

globalLimiters.syncXmlAuthLimiter ??= createRateLimiter({ limit: 5, windowMs: 60_000 });
globalLimiters.syncXmlSensitiveLimiter ??= createRateLimiter({ limit: 60, windowMs: 60_000 });

export const authRateLimiter = globalLimiters.syncXmlAuthLimiter;
export const sensitiveRateLimiter = globalLimiters.syncXmlSensitiveLimiter;

export function getRateLimitKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || request.headers.get("cookie")
    || "anonymous";
}

