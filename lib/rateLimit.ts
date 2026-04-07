// Simple in-memory rate limiter — good enough for a low-traffic shop on Vercel.
// Each serverless function instance maintains its own counter; resets when the
// instance is recycled. Pairs well with Vercel's edge-level DDoS protection.

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * @param key      Unique key (e.g. IP + route)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

export function getIp(req: Request): string {
  const xff = (req.headers as Headers).get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "unknown";
}
