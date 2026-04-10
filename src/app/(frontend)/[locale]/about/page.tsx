import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/utils'
import PageBanner from '@/components/ui/PageBanner'
import RichText from '@/components/ui/RichText'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const loc = locale as 'en' | 'zh'
  const [aboutPage] = await Promise.all([
    payload.findGlobal({ slug: 'about-page', locale: loc }).catch(() => null),
  ])
  const meta = (aboutPage as any)?.meta || []
    // (aboutContent as any)?.meta
  return {
    title: meta?.title || (loc === 'zh' ? '關於我們 | 力新邦威' : 'About Us | Atom Bondway'),
    description: meta?.description || (loc === 'zh'
      ? '力新邦威有限公司是優質幕牆建築工程材料的官方香港經銷商。於2001年成立，多年來一直致力與主要伙伴緊密合作，以安全、可靠及專業為宗旨，為客戶提供頂級的幕牆系統及結構密封服務。'
      : 'Atom Bondway Co. Ltd. is the official distributor of high-performance building materials for curtain wall façade projects in Hong Kong. Founded in 2001, we work closely with our major brand partners to provide top quality curtain wall systems and structural sealant services to our valued customers. With over decades of service, Atom Bondway strives to always deliver Safety, Trust, and Professionalism.'),
    alternates: {
      canonical: absoluteUrl(locale === 'en' ? '/about' : `/${locale}/about`),
      languages: { en: absoluteUrl('/about'), zh: absoluteUrl('/zh/about') },
    },
  }
}

const DEFAULT_PARTNERS = [
  // { name: 'Dow',              logoUrl: '/images/partners/dow-logo.png' },
  // { name: 'Saint-Gobain',     logoUrl: '/images/partners/saint-gobain-logo.png' },
  // { name: "Wood's Powr-Grip", logoUrl: '/images/partners/woods-powr-grip-logo.png' },
  // { name: 'Intelli-Grip',     logoUrl: '/images/partners/intelli-grip-logo.jpg' },
]

// Helper: check if a richText field has actual content
function hasRichText(data: any): boolean {
  return !!data?.root?.children?.length
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const loc = locale as 'en' | 'zh'
  const isZh = loc === 'zh'

  const payload = await getPayloadClient()
  const aboutPage = await payload.findGlobal({ slug: 'about-page', locale: loc, depth: 1 }).catch(() => null) as any

  const pageTitle     = aboutPage?.pageTitle    || (isZh ? '關於力新邦威' : 'Who We Are')
  const pageBody      = aboutPage?.pageBody     // richText | null
  const visionTitle   = aboutPage?.visionTitle  || (isZh ? '願景' : 'Vision')
  const visionBody    = aboutPage?.visionBody   // richText | null
  const missionTitle  = aboutPage?.missionTitle || (isZh ? '宗旨' : 'Mission')
  const missionBody   = aboutPage?.missionBody  // richText | null
  const partnersTitle = aboutPage?.partnersTitle || (isZh ? '伙伴' : 'Partners')
  // Partners: use CMS entries if any, else defaults
  const cmsPartners: any[] = aboutPage?.partners || []
  const partners = cmsPartners.length > 0 ? cmsPartners : []
  // const partners = DEFAULT_PARTNERS

  return (
    <div className="bg-white">
      <PageBanner />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12 md:py-16">
        <h1 className="page-title font-bold text-[#10242b] mb-6">{pageTitle}</h1>

        {/* Company description */}
        {hasRichText(pageBody) ? (
          <div className="mb-10">
            {/* max-w-3xl */}
            <RichText data={pageBody} />
          </div>
        ) : (
          <p className="text-gray-600 leading-relaxed mb-10">
            {isZh
              ? '力新邦威有限公司是優質幕牆建築工程材料的官方香港經銷商。於2001年成立，多年來一直致力與主要伙伴緊密合作，以安全、可靠及專業為宗旨，為客戶提供頂級的幕牆系統及結構密封服務。'
              : 'Atom Bondway Co. Ltd. is the official distributor of high-performance building materials for curtain wall facade projects in Hong Kong. Founded in 2001, we work closely with our major brand partners to provide top quality curtain wall systems and structural sealant services to our valued customers. With over decades of service, Atom Bondway strives to always deliver Safety, Trust, and Professionalism.'}
          </p>
        )}

        {/* Vision */}
        <h2 className="page-sub-title text-2xl font-bold text-[#10242b] mb-2">{visionTitle}</h2>
        {hasRichText(visionBody) ? (
          <div className="mb-8">
            <RichText data={visionBody} />
          </div>
        ) : (
          <p className="text-gray-600 leading-relaxed mb-8">
            {isZh ? '供應香港能引以為傲的幕牆系統' 
            : 'Be the reason why Hong Kong is proud of their curtain wall systems.'}
          </p>
        )}

        {/* Mission */}
        <h2 className="page-sub-title text-2xl font-bold text-[#10242b] mb-2">{missionTitle}</h2>
        {hasRichText(missionBody) ? (
          <div className="mb-10">
            <RichText data={missionBody} />
          </div>
        ) : (
          <p className="text-gray-600 leading-relaxed mb-10">
            {isZh
              ? '透過高品質的產品及服務傳遞安全、可靠及專業的服務理念。'
              : 'Deliver Trust, Safety, and Professionalism through our top quality products and services.'}
          </p>
        )}

        {/* Partners */}
        <h2 className="page-sub-title text-2xl font-bold text-[#10242b] mb-6">{partnersTitle}</h2>
        <div className="flex flex-wrap items-center gap-8">
          {partners.map((p: any) => {
            const src = p.logo?.url || p.logoUrl || ''
            if (!src) return null
            return (
              <div key={p.name} className="flex items-center justify-center">
                <Image
                  src={src}
                  alt={p.name}
                  width={220}
                  height={90}
                  className="object-contain"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
