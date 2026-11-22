import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // viewTransition: page-to-page transitions through React's <ViewTransition> (components/page-transition.tsx).
  experimental: { inlineCss: true, viewTransition: true },
  allowedDevOrigins: ['192.168.29.2'],
  poweredByHeader: false,
  // Renamed and retired URLs (v3.0 navigation: Solutions, How It Works, Who We Help, Why BesideYou).
  // Temporary (307) until the owner signs off on the new structure; then make them permanent.
  async redirects() {
    return [
      { source: '/the-pilot', destination: '/why-besideyou', permanent: false },
      { source: '/pay-per-qualified-call', destination: '/why-besideyou', permanent: false },
      { source: '/who-we-work-with', destination: '/who-we-help', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

