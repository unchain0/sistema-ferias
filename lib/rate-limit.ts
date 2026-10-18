import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  readonly interval: number; // in milliseconds
  readonly maxRequests: number;
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const { interval, maxRequests } = config;

  const existingRecord = rateLimitStore.get(identifier);
  if (existingRecord === undefined) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + interval,
    });
    return true;
  }

  const record = existingRecord;

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + interval;
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

export function createRateLimitResponse(retryAfter?: number): ReturnType<typeof NextResponse.json> {
  const response = NextResponse.json(
    { error: 'Muitas requisições. Tente novamente mais tarde.' },
    { status: 429 }
  );

  if (retryAfter !== undefined) {
    response.headers.set('Retry-After', Math.ceil(retryAfter / 1000).toString());
  }

  response.headers.set('X-RateLimit-Limit', '100');

  return response;
}

export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor !== null && forwardedFor !== '') {
    const parts = forwardedFor.split(',');
    const firstIp = parts[0];
    if (firstIp !== undefined) return firstIp.trim();
  }

  if (realIp !== null) {
    return realIp;
  }

  // Fallback to a generic identifier (not ideal for production)
  return 'unknown';
}