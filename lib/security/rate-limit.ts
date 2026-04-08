type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, RateLimitBucket>();
let operationCounter = 0;

function cleanupExpiredBuckets(now: number) {
  operationCounter += 1;
  if (operationCounter % 200 !== 0) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const current = buckets.get(options.key);
  if (!current || current.resetAt <= now) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: Math.max(0, options.maxRequests - 1),
      retryAfterSeconds: 0,
    };
  }

  current.count += 1;
  const allowed = current.count <= options.maxRequests;
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(1, Math.ceil((current.resetAt - now) / 1000));

  return {
    allowed,
    limit: options.maxRequests,
    remaining: Math.max(0, options.maxRequests - current.count),
    retryAfterSeconds,
  };
}

export function getRequestIdentifier(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}