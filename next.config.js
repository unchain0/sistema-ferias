/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { dev, isServer }) => {
    // Desabilitar cache persistente completamente
    config.cache = false;

    // Usar apenas cache em memória para desenvolvimento
    if (dev && !isServer) {
      config.cache = {
        type: 'memory',
      };
    }

    // Desabilitar snapshots que causam problemas no Windows
    config.snapshot = {
      managedPaths: [],
      immutablePaths: [],
    };

    // Ignorar warnings de source maps
    config.ignoreWarnings = [{ module: /node_modules/ }];

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
          // CSP: More restrictive policy
          // Note: 'unsafe-inline' is still needed for Next.js styled-jsx and inline styles
          // 'unsafe-eval' is removed in production but may be needed for development
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // In production, consider using nonces for scripts
              // For now, unsafe-inline is required for Next.js
              process.env.NODE_ENV === 'production'
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Security: Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
