import { NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Use global to persist across hot reloads in development
const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: RateLimitStore | undefined;
  rateLimitCleanupInterval: ReturnType<typeof setInterval> | undefined;
};

// Initialize or reuse existing store
const rateLimitStore: RateLimitStore = globalForRateLimit.rateLimitStore ?? {};

// Store reference in global for persistence
if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit.rateLimitStore = rateLimitStore;
}

// Cleanup old entries every 5 minutes
// Clear existing interval before creating new one (prevents memory leak in dev)
if (globalForRateLimit.rateLimitCleanupInterval) {
  clearInterval(globalForRateLimit.rateLimitCleanupInterval);
}

const cleanupInterval = setInterval(
  () => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((key) => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    });
  },
  5 * 60 * 1000,
);

// Store interval reference for cleanup on hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit.rateLimitCleanupInterval = cleanupInterval;
}

// Ensure interval doesn't prevent process exit
cleanupInterval.unref?.();

export interface RateLimitConfig {
  interval: number; // in milliseconds
  maxRequests: number;
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const { interval, maxRequests } = config;

  if (!rateLimitStore[identifier]) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + interval,
    };
    return true;
  }

  const record = rateLimitStore[identifier];

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

export function createRateLimitResponse(retryAfter?: number) {
  const response = NextResponse.json(
    { error: 'Muitas requisições. Tente novamente mais tarde.' },
    { status: 429 },
  );

  if (retryAfter) {
    response.headers.set('Retry-After', Math.ceil(retryAfter / 1000).toString());
  }

  response.headers.set('X-RateLimit-Limit', '100');

  return response;
}

export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier (not ideal for production)
  return 'unknown';
}
