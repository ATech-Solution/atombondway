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

export function getMediaUrl(media: { url?: string | null } | null | undefined): string | null {
  if (!media?.url) return null
  const url = media.url

  // If it's already an absolute URL, return as is
  if (url.startsWith('http')) {
    return url
  }

  // If it's a relative path starting with /, make it absolute
  if (url.startsWith('/')) {
    const base = getSiteUrl()
    return `${base}${url}`
  }

  // For any other case, return as is
  return url
}