import type { Metadata } from 'next'
import { absoluteUrl, getAbsoluteMediaUrl } from '@/lib/utils'

interface PageMeta {
  title?: string | null
  description?: string | null
  keywords?: string | null
  ogImage?: { url?: string | null } | null
  noIndex?: boolean | null
}

interface SiteDefaults {
  title?: string | null
  description?: string | null
  keywords?: string | null
  ogImage?: { url?: string | null } | null
  noindex?: boolean | null
  companyName?: string | null
}

interface BuildSeoOptions {
  locale: string
  /** Route path starting with /, e.g. '/about' or '/projects/my-slug' */
  path: string
  /** Page-level SEO fields from CMS (meta.*) */
  meta?: PageMeta | null
  /** Site-wide defaults from SiteSettings global */
  defaults?: SiteDefaults | null
  /** Content-level title fallback (pageTitle, project.title, etc.) */
  fallbackTitle?: string
  /** Content-level description fallback (pageSubtitle, project.summary, etc.) */
  fallbackDescription?: string
}

/**
 * Builds a consistent Metadata object with a full fallback chain:
 *   page meta → content fallback → site defaults → hardcoded last resort
 *
 * Applies on every page:
 *   - robots (respects both page-level noIndex and global noindex)
 *   - openGraph
 *   - twitter card
 *   - canonical + alternates.languages (en / zh)
 */
export function buildSeoMetadata({
  locale,
  path,
  meta,
  defaults,
  fallbackTitle,
  fallbackDescription,
}: BuildSeoOptions): Metadata {
  const title =
    meta?.title ||
    fallbackTitle ||
    defaults?.title ||
    defaults?.companyName ||
    'Atom Bondway'

  const description =
    meta?.description ||
    fallbackDescription ||
    defaults?.description ||
    ''

  const keywords = (meta?.keywords || defaults?.keywords) ?? undefined

  const ogImageUrl = getAbsoluteMediaUrl(meta?.ogImage) || getAbsoluteMediaUrl(defaults?.ogImage) || null

  const noindex = meta?.noIndex === true || defaults?.noindex === true

  const canonicalUrl = absoluteUrl(locale === 'en' ? path : `/${locale}${path}`)

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: absoluteUrl(path),
        zh: absoluteUrl(`/zh${path}`),
      },
    },
    openGraph: {
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}
