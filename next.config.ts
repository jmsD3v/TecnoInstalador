import type { NextConfig } from "next"
import { withSentryConfig } from '@sentry/nextjs'

// CSP is now set per-request by src/proxy.ts (middleware) with a unique nonce.
// Only non-CSP security headers are set statically here.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry org/project — set via SENTRY_ORG and SENTRY_PROJECT env vars
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Disable source map uploading in local dev (no SENTRY_AUTH_TOKEN needed)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Disable Sentry webpack plugin if DSN not set (local dev)
  disableLogger: true,
  automaticVercelMonitors: false,
})
