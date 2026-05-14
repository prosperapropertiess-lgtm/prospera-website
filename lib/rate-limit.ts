/**
 * In-process rate limiter using a sliding window counter.
 * Works across Vercel serverless invocations within the same warm instance.
 * For production scale, swap the Map for Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * @param key       Unique identifier (e.g. IP + route)
 * @param limit     Max requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  entry.count++;
  const resetInMs = windowMs - (now - entry.windowStart);

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  return { allowed: true, remaining: limit - entry.count, resetInMs };
}

// Convenience: get client IP from Next.js request headers
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
