import { NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

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
    { status: 429 }
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
