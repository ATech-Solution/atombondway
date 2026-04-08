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

/**
 * Build the absolute URL for a page (for canonical links and OG tags).
 */
export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/**
 * Get the URL for a Payload media item.
 */
export function getMediaUrl(media: { url?: string | null } | null | undefined): string | null {
  if (!media?.url) return null
  // If the URL is already absolute, return as-is
  if (media.url.startsWith('http')) return media.url
  return media.url
}
