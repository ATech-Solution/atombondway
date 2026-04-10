import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { routing } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/payload'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { json } from 'stream/consumers'

export const revalidate = 3600

/**
 * Locale layout — nested inside FrontendRootLayout.
 *
 * Responsibilities:
 *  - Validate + activate the current locale for next-intl
 *  - Fetch all globals needed by the shell (Header, Footer, custom CSS)
 *  - Provide the NextIntlClientProvider for client components
 *  - Inject user-defined custom CSS via a hoisted <style> tag
 *
 * <html> and <body> are intentionally absent here — they live in the parent
 * FrontendRootLayout so the locale layout stays focused on content structure.
 */

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as 'en' | 'zh',
      depth: 1,
    })
    const companyName = (settings as any)?.companyName || 'Company Profile'
    const noindex = (settings as any)?.noindex === true
    const faviconUrl = (settings as any)?.favicon?.url
    return {
      title: { default: companyName, template: `%s | ${companyName}` },
      robots: noindex ? { index: false, follow: false } : undefined,
      icons: faviconUrl ? { icon: faviconUrl, shortcut: faviconUrl } : undefined,
    }
  } catch {
    return { title: 'Company Profile' }
  }
}

const getGlobals = unstable_cache(
  async (locale: string) => {
    const payload = await getPayloadClient()
    const loc = locale as 'en' | 'zh'
    const [siteSettings, navigation, footerSettings, customCss] = await Promise.all([      
      payload.findGlobal({ slug: 'site-settings', locale: loc }).catch(() => null),
      payload.findGlobal({ slug: 'navigation', locale: loc }).catch(() => null),
      payload.findGlobal({ slug: 'footer-settings', locale: loc }).catch(() => null),
      payload.findGlobal({ slug: 'custom-css' }).catch(() => null),
    ])
    return { siteSettings, navigation, footerSettings, customCss }
  },
  ['layout-globals'],
  { revalidate: 3600 },
)

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Must be called before any async operations that use next-intl APIs
  setRequestLocale(locale)
  const messages = await getMessages()

  const { siteSettings, navigation, footerSettings, customCss } = await getGlobals(locale)
  const customCssString = (customCss as any)?.css ?? ''

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* React 19 hoists <style precedence> into <head> regardless of render position */}
      {customCssString && (
        <style precedence="low" dangerouslySetInnerHTML={{ __html: customCssString }} />
      )}
      <Header
        siteSettings={siteSettings}
        navigation={navigation}
        locale={locale}
      />
      {/* pt-[80px] = mobile fixed header height; pt-[109px] = desktop — only when stickyHeader is on  pt-[80px] lg:pt-[109px]*/}
      <main className={(siteSettings as any)?.stickyHeader ? '' : ''}>{children}</main>
      <Footer
        siteSettings={siteSettings}
        footerSettings={footerSettings}
        locale={locale}
      />
    </NextIntlClientProvider>
  )
}
