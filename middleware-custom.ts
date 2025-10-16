import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting for middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000); // Clean up every minute

export function customSecurityMiddleware(request: NextRequest) {
  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;

  // Apply stricter rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // 100 requests per minute per IP
    const allowed = checkRateLimit(`api:${ip}`, 100, 60000);
    
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas requisições. Tente novamente em alguns segundos.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // Block common attack patterns
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'nessus',
    'openvas',
    'acunetix',
  ];

  if (suspiciousPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block requests with suspicious query parameters
  const url = request.nextUrl;
  const suspiciousParams = ['<script', 'javascript:', 'onerror=', 'onload=', '../', '..\\'];
  
  for (const param of url.searchParams.values()) {
    if (suspiciousParams.some(pattern => param.toLowerCase().includes(pattern))) {
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  return NextResponse.next();
}
