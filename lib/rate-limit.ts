interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

export function createRateLimiter(config: RateLimiterConfig) {
  const { maxRequests, windowMs } = config;

  return function checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let entry = store.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(identifier, entry);
    }

    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    const remaining = Math.max(0, maxRequests - entry.timestamps.length);
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow ? oldestInWindow + windowMs : now + windowMs;

    if (entry.timestamps.length >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt };
    }

    entry.timestamps.push(now);
    return { allowed: true, remaining: remaining - 1, resetAt };
  };
}

export const backtestRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
});
