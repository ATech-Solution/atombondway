/**
 * Merge Tailwind CSS class names safely.
 * Lightweight alternative to clsx + tailwind-merge.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a date for display.
 */
export function formatDate(date: string | Date, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale === 'zh' ? 'zh-HK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Truncate a string to a max length, adding ellipsis if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

function envUrl(key: string): string | undefined {
  const suffix = process.env.NODE_ENV === 'production' ? '_PROD' : '_DEV'
  return process.env[`${key}${suffix}`] || process.env[key]
}

export function getSiteUrl(): string {
  return (envUrl('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000').replace(/\/$/, '')
}

export function getDomainUrl(): string {
  return (envUrl('NEXT_PUBLIC_DOMAIN') || getSiteUrl()).replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const base = getDomainUrl()
  return `${base}/${path.replace(/^\//, '')}`
}

/**
 * Returns the URL for a Payload media object.
 *
 * Relative paths (/media/...) are returned as-is so next/image resolves
 * them as local files via localPatterns — no host needed, no config risk.
 * Only truly external URLs (CDN, etc.) are returned unchanged as absolute.
 */
export function getMediaUrl(media: { url?: string | null } | null | undefined): string | null {
  if (!media?.url) return null
  return media.url
}

/**
 * Like getMediaUrl but always returns an absolute URL.
 * Use this only where absolute URLs are required (e.g. OG image meta tags).
 */
export function getAbsoluteMediaUrl(media: { url?: string | null } | null | undefined): string | null {
  const url = getMediaUrl(media)
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${getSiteUrl()}${url.startsWith('/') ? url : `/${url}`}`
}