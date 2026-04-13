import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

function envUrl(key: string): string | undefined {
  const suffix = process.env.NODE_ENV === 'production' ? '_PROD' : '_DEV'
  return process.env[`${key}${suffix}`] || process.env[key]
}

const siteUrl = envUrl('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000'
const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || siteUrl
const productionHostname = siteUrl
  ? new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`).hostname
  : null
const mediaHostname = mediaBaseUrl
  ? new URL(mediaBaseUrl.startsWith('http') ? mediaBaseUrl : `https://${mediaBaseUrl}`).hostname
  : null

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  productionBrowserSourceMaps: false,
  sassOptions: {
    silenceDeprecations: ['import'],
    // silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 128, 256, 384],
    localPatterns: [
      { pathname: '/images/**', search: '' },
      { pathname: '/media/**', search: '' },
    ],
    remotePatterns: [
      // Dev: Payload serves absolute URLs via its API or static endpoint
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      // Production: allow the configured site hostname
      ...(productionHostname
        ? [
            { protocol: 'https' as const, hostname: productionHostname, pathname: '/api/media/**' },
            { protocol: 'https' as const, hostname: productionHostname, pathname: '/media/**' },
          ]
        : []),
      // If a separate media URL is configured, add it as a remote pattern
      ...(mediaHostname && mediaHostname !== productionHostname
        ? [{ protocol: 'https' as const, hostname: mediaHostname, pathname: '/media/**' }]
        : []),
    ],
  },
  async rewrites() {
    return [
      // Route all /media/* requests through Payload's file API so uploaded files
      // are served correctly in standalone deployments where public/ isn't auto-served.
      {
        source: '/media/:path*',
        destination: '/api/media/file/:path*',
      },
      // Favicon is stored as a media upload; proxy it through the same API.
      {
        source: '/favicon.ico',
        destination: '/api/media/file/favicon.ico',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  // turbopack: {
  //   rules: {
  //     '*.svg': {
  //       loaders: ['@svgr/webpack'],
  //       as: '*.js',
  //     },
  //   },
  // },
}

export default withPayload(withNextIntl(nextConfig))
