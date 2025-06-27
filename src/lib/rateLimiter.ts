// lib/rateLimiter.ts
const rateLimitMap = new Map<
  string,
  { count: number; timer: NodeJS.Timeout }
>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const existing = rateLimitMap.get(key);

  if (existing) {
    if (existing.count >= max) {
      return false;
    }
    existing.count += 1;
  } else {
    const timer = setTimeout(() => {
      rateLimitMap.delete(key);
    }, windowMs);

    rateLimitMap.set(key, { count: 1, timer });
  }

  return true;
}
