import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

function envUrl(key: string): string | undefined {
  const suffix = process.env.NODE_ENV === 'production' ? '_PROD' : '_DEV'
  return process.env[`${key}${suffix}`] || process.env[key]
}

const siteUrl = envUrl('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000'
const productionHostname = siteUrl
  ? new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`).hostname
  : null

const nextConfig: NextConfig = {
  output: 'standalone',
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
      { pathname: '/media/**',  search: '' },
      { pathname: '/images/**', search: '' },
    ],
    remotePatterns: [
      // Dev: Payload serves absolute URLs via its API endpoint
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
      // Production: allow the configured site hostname
      ...(productionHostname
        ? [
            { protocol: 'https' as const, hostname: productionHostname, pathname: '/api/media/**' },
            { protocol: 'https' as const, hostname: productionHostname, pathname: '/media/**' },
          ]
        : []),
    ],
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
