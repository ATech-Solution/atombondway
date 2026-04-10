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
// import ContactSection from '@/components/sections/ContactSection'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const payloadLocale = locale as 'en' | 'zh'

  const [homePage, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', locale: payloadLocale }).catch(() => null),
    payload.findGlobal({ slug: 'site-settings', locale: payloadLocale }).catch(() => null),
  ])

  // SEO priority: homepage SEO fields → site defaultMeta → companyName fallback
  const pageSeo = homePage as any
  const defaultMeta = (siteSettings as any)?.defaultMeta
  const companyName = (siteSettings as any)?.companyName || 'Company'

  const title = pageSeo?.seoTitle || defaultMeta?.title || companyName
  const description = pageSeo?.seoDescription || defaultMeta?.description || ''
  const keywords = pageSeo?.seoKeywords || defaultMeta?.keywords
  const ogImageUrl = pageSeo?.seoOgImage?.url || defaultMeta?.ogImage?.url
  const noindex = (siteSettings as any)?.noindex === true

  return {
    title,
    description,
    keywords,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
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
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function HomePageRoute({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const payloadLocale = locale as 'en' | 'zh'

  // Fetch all homepage content in parallel
  const [homePage, projectsResult, productsResult] = await Promise.all([
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
  ])

  return (
    <>
      <HeroSection 
        locale={locale}
        homePageData={homePage}
      />
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
      <ServicesSection 
        locale={locale} 
        homePageData={homePage} 
      />
      <AboutSection 
        locale={locale} 
        homePageData={homePage} 
      />
      {/* <ContactSection data={contactInfo} locale={locale} /> */}
    </>
  )
}
