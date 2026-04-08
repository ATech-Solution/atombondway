import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { absoluteUrl } from '@/lib/utils'
import HeroSection from '@/components/sections/HeroSection'
import RecentProjectsSection from '@/components/sections/RecentProjectsSection'
import FeaturedProductsSection from '@/components/sections/FeaturedProductsSection'
import ServicesSection from '@/components/sections/ServicesSection'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const payloadLocale = locale as 'en' | 'zh'

  const [hero, homePage, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'hero-content', locale: payloadLocale }).catch(() => null),
    payload.findGlobal({ slug: 'home-page', locale: payloadLocale }).catch(() => null),
    payload.findGlobal({ slug: 'site-settings', locale: payloadLocale }).catch(() => null),
  ])

  // SEO: prefer home-page global meta, then hero meta, then site defaults
  const meta = (homePage as any)?.meta || (hero as any)?.meta
  const defaultMeta = (siteSettings as any)?.defaultMeta
  const title = meta?.title || defaultMeta?.title || (siteSettings as any)?.companyName || 'Company Profile'
  const description = meta?.description || defaultMeta?.description || ''

  return {
    title,
    description,
    keywords: meta?.keywords || defaultMeta?.keywords,
    alternates: {
      canonical: absoluteUrl(locale === 'en' ? '/' : `/${locale}`),
      languages: {
        en: absoluteUrl('/'),
        zh: absoluteUrl('/zh'),
      },
    },
    openGraph: {
      title,
      description,
      images: meta?.ogImage?.url ? [meta.ogImage.url] : [],
    },
  }
}

export default async function HomePageRoute({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const payloadLocale = locale as 'en' | 'zh'

  // Fetch all homepage content in parallel
  const [hero, homePage, projectsResult, productsResult, servicesResult, about, contactInfo] = await Promise.all([
    payload.findGlobal({ slug: 'hero-content', locale: payloadLocale }).catch(() => null),
    payload.findGlobal({ slug: 'home-page', locale: payloadLocale }).catch(() => null),
    payload
      .find({
        collection: 'projects',
        where: { featured: { equals: true } },
        limit: 20,
        sort: 'order',
        locale: payloadLocale,
      })
      .catch(() => ({ docs: [] })),
    payload
      .find({
        collection: 'products',
        where: { featured: { equals: true } },
        limit: 3,
        sort: 'order',
        locale: payloadLocale,
      })
      .catch(() => ({ docs: [] })),
    payload
      .find({
        collection: 'services',
        limit: 4,
        sort: 'order',
        locale: payloadLocale,
      })
      .catch(() => ({ docs: [] })),
    payload.findGlobal({ slug: 'about-content', locale: payloadLocale }).catch(() => null),
    payload.findGlobal({ slug: 'contact-info', locale: payloadLocale }).catch(() => null),
  ])

  return (
    <>
      <HeroSection data={hero} />
      <RecentProjectsSection
        projects={projectsResult.docs}
        locale={locale}
        homePageData={homePage}
      />
      <FeaturedProductsSection
        products={productsResult.docs}
        locale={locale}
        homePageData={homePage}
      />
      <ServicesSection services={servicesResult.docs} locale={locale} homePageData={homePage} />
      <AboutSection data={{ ...about, _locale: locale }} homePageData={homePage} />
      {/* <ContactSection data={contactInfo} locale={locale} /> */}
    </>
  )
}
