import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { buildSeoMetadata } from '@/lib/seo'

export const revalidate = 3600
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

  const pageSeo = homePage as any
  const ss = siteSettings as any

  return buildSeoMetadata({
    locale,
    path: '/',
    meta: {
      title: pageSeo?.seoTitle,
      description: pageSeo?.seoDescription,
      keywords: pageSeo?.seoKeywords,
      ogImage: pageSeo?.seoOgImage,
      noIndex: null,
    },
    defaults: {
      ...ss?.defaultMeta,
      noindex: ss?.noindex,
      companyName: ss?.companyName,
    },
  })
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
