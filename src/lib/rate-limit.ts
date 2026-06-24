// In-memory rate limiter with optional Redis/Upstash support.
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for distributed limiting
// across Vercel instances. Falls back to in-memory if vars are absent.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

async function checkRateLimitRedis(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  // encodeURIComponent prevents path traversal if identifier contains '/' or other special chars
  const key = encodeURIComponent(`rl:${identifier}`);
  const windowSec = Math.ceil(windowMs / 1000);

  const incrRes = await fetch(`${baseUrl}/incr/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result: count } = await incrRes.json();

  if (count === 1) {
    await fetch(`${baseUrl}/expire/${key}/${windowSec}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const ttlRes = await fetch(`${baseUrl}/ttl/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result: ttl } = await ttlRes.json();
  const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);

  return {
    success: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt,
  };
}

function checkRateLimitMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 60 * 1000
): Promise<RateLimitResult> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return checkRateLimitRedis(identifier, maxRequests, windowMs);
  }
  return checkRateLimitMemory(identifier, maxRequests, windowMs);
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // In Vercel, the real client IP is the LAST entry in x-forwarded-for.
    // Earlier entries can be spoofed by the client.
    const ips = forwardedFor.split(',').map((s) => s.trim());
    return ips[ips.length - 1];
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  return 'unknown';
}
