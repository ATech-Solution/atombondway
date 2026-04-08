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
  const loc = locale as 'en' | 'zh'
  return {
    title: loc === 'zh' ? '服務 | 力新邦威' : 'Services | Atom Bondway',

    alternates: {
      canonical: absoluteUrl(locale === 'en' ? '/services' : `/${locale}/services`),
      languages: { en: absoluteUrl('/services'), zh: absoluteUrl('/zh/services') },
    },
  }
}

// Static fallback — used only when Collections > Services is empty
const SERVICES_STATIC: Record<string, { icon: string; title: string; body: string[] }[]> = {
  en: [
    {
      icon: '/images/service-drawing.png',
      title: 'Print Review',
      body: [
        'Print Review is the examination of project plans to advise the applicators on the technical specifications for sealant applications.',
        'Detailed drawings covering panel size, windload, bite, and glueline details must be provided. The resulting report addresses structural bite, glueline thickness, and remarks on weatherseals or related sealant specifics.',
      ],
    },
    {
      icon: '/images/service-testing.png',
      title: 'Sample Testing',
      body: [
        'Sample Testing evaluates how construction substrates adhere to and work with sealants. Glass, aluminum, and stone samples require adhesion testing with recommendations provided.',
        'Glazing components like spacers, gaskets, and setting blocks undergo compatibility assessments. Testing includes Norton tapes and Atomcell backer rod samples, with a detailed compatibility report issued.',
      ],
    },
    {
      icon: '/images/service-cutting.png',
      title: 'Deglaze',
      body: [
        'Deglaze is a quality control process for testing the quality of sealant application. It involves cutting through cured sealants to measure adhesion quality and verify proper joint fill.',
        'The process records structural bite, glueline, and joint dimension measurements to confirm the application meets the required standards.',
      ],
    },
    {
      icon: '/images/service-cert.png',
      title: 'Warranty Certification',
      body: [
        'Certification for structural sealant glazing and weatherseal applications requires satisfactory testing completion, recommendation compliance, and in-house quality assurance approval.',
        'Projects meeting these criteria receive 10 years of warranty coverage.',
      ],
    },
  ],
  zh: [
    {
      icon: '/images/service-drawing.png',
      title: '審圖',
      body: [
        '審圖是對項目圖紙的審查，以就密封膠應用的技術規格向施工人員提供意見。',
        '必須提供包括面板尺寸、風荷載、咬合及膠縫詳情的詳細圖紙。所出具的報告涵蓋結構咬合、膠縫厚度及防水密封或相關密封膠規格的備注。',
      ],
    },
    {
      icon: '/images/service-testing.png',
      title: '樣本測試',
      body: [
        '樣本測試評估建築底材與密封膠的粘合及相容情況。需提供玻璃、鋁及石材樣本進行粘合測試並提供建議。',
        '間隔條、墊片及墊塊等玻璃配件需進行相容性評估，測試包括Norton間隔膠帶及Atomcell背襯帶樣本，並出具詳細相容性報告。',
      ],
    },
    {
      icon: '/images/service-cutting.png',
      title: '割膠服務',
      body: [
        '割膠服務是測試密封膠施工質量的質量控制程序，通過切割已固化密封膠來測量粘合質量並核實接縫填充是否到位。',
        '該程序記錄結構咬合、膠縫及接縫尺寸測量數據，以確認施工符合所需標準。',
      ],
    },
    {
      icon: '/images/service-cert.png',
      title: '質素認證證書',
      body: [
        '結構密封膠玻璃安裝及防水密封應用的認證，需完成令人滿意的測試、遵守相關建議並通過內部質量保證審核。',
        '符合上述條件的項目可獲得10年保修。',
      ],
    },
  ],
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const loc = locale as 'en' | 'zh'

  const payload = await getPayloadClient()
  const cmsServicesResult = await payload
    .find({ collection: 'services', locale: loc, sort: 'order', limit: 20, depth: 1 })
    .catch(() => ({ docs: [] }))

  const pageTitle = loc === 'zh' ? '我們的服務' : 'Our Services'
  const cmsServices: any[] = cmsServicesResult.docs || []
  const useStatic = cmsServices.length === 0

  return (
    <div className="bg-white">
      <PageBanner />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12 md:py-16">
        <h1 className="page-title font-bold text-[#10242b] mb-4">{pageTitle}</h1>

        <p className="text-gray-600 text-xl leading-relaxed mb-12 max-w-3xl">
          {loc === 'zh'
            ? '力新邦威有限公司為客戶提供項目管理服務，請與我們了解更多關於我們的服務範疇。'
            : 'Atom Bondway provides Project Management Services for our customers. Please contact us to learn more about our service offerings.'}
        </p>

        {/* CMS services from Collections > Services */}
        {!useStatic && (
          <div className="space-y-12">
            {cmsServices.map((svc: any) => (
              <div key={svc.id} className="grid grid-cols-12 gap-6 items-start">
                {svc.image?.url && (
                  <div className="col-span-4 sm:col-span-2 flex justify-center vertical-center h-full">
                    <Image
                      src={svc.image.url}
                      alt={svc.image.alt || svc.title}
                      width={100}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                )}
                <div className={svc.image?.url ? 'col-span-8 sm:col-span-10 max-w-3xl' : 'col-span-12 max-w-3xl'}>
                  <h2 className="page-sub-title text-2xl font-bold text-[#10242b] mb-3">{svc.title}</h2>
                  {svc.shortDescription && (
                    <p className="text-gray-500 mb-3 leading-relaxed">{svc.shortDescription}</p>
                  )}
                  {svc.description?.root?.children?.length > 0 && (
                    <div className="mb-8">
                      <RichText data={svc.description} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Static fallback */}
        {useStatic && (
          <div className="space-y-12">
            {(SERVICES_STATIC[loc] ?? []).map((svc) => (
              <div key={svc.title} className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-2 sm:col-span-1 flex justify-center pt-1">
                  <Image src={svc.icon} alt={svc.title} width={60} height={60} className="object-contain" />
                </div>
                <div className="col-span-10 sm:col-span-11">
                  <h2 className="text-xl font-bold text-[#10242b] mb-3">{svc.title}</h2>
                  {svc.body.map((para, i) => (
                    <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
