/**
 * Security headers configuration
 * Used for both Next.js config and any custom middleware
 */
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

/**
 * Content Security Policy configuration
 * Note: 'unsafe-inline' is required for Next.js styled-jsx and inline styles
 * 'unsafe-eval' should be avoided in production but may be needed for development
 */
export function getContentSecurityPolicy(isDevelopment = false): string {
  const directives = [
    "default-src 'self'",
    // In production, unsafe-eval is removed for security
    isDevelopment
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return directives.join('; ');
}

/**
 * Get all security headers including CSP
 */
export function getAllSecurityHeaders(isDevelopment = false) {
  return [
    ...securityHeaders,
    {
      key: 'Content-Security-Policy',
      value: getContentSecurityPolicy(isDevelopment),
    },
  ];
}
