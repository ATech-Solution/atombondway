import Image from 'next/image'
import { Link } from '@/i18n/navigation'

/* Static service data matching atombondway.com exactly */
const SERVICES_ZH = [
  { id: 's1', icon: '/images/service-drawing.png',  title: '審圖' },
  { id: 's2', icon: '/images/service-testing.png',  title: '樣本測試' },
  { id: 's3', icon: '/images/service-cutting.png',  title: '割膠服務' },
  { id: 's4', icon: '/images/service-cert.png',     title: '質素認證證書' },
]
const SERVICES_EN = [
  { id: 's1', icon: '/images/service-drawing.png',  title: 'Print Review' },
  { id: 's2', icon: '/images/service-testing.png',  title: 'Sample Test' },
  { id: 's3', icon: '/images/service-cutting.png',  title: 'Deglaze' },
  { id: 's4', icon: '/images/service-cert.png',     title: 'Warranty Certification' },
]

interface Props { services: any[]; locale: string; fullPage?: boolean; homePageData?: any }

export default async function ServicesSection({ services, locale, fullPage, homePageData }: Props) {
  const staticServices = locale === 'zh' ? SERVICES_ZH : SERVICES_EN

  // Use CMS services if available, else use static fallback
  const items = services?.length
    ? services.map((s: any, i: number) => ({
        id: s.id,
        icon: staticServices[i]?.icon || '/images/service-drawing.png',
        title: s.title || staticServices[i]?.title,
        shortDescription: s.shortDescription,
        slug: s.slug,
      }))
    : staticServices

  return (
    <section className="services-section py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">

        {!fullPage && (
          <div className="mb-10">
            <h2 className="section-title text-center text-[#10242b] text-2xl font-normal mb-4">
              {locale === 'zh' ? '我們的服務' : 'OUR SERVICES'}
            </h2>
          </div>
        )}

        {/* 4-column icon tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {items.map((svc: any) => (
            <div
              key={svc.id}
              className="flex flex-col items-center text-center p-6
                         border border-[#034F98]/20 hover:border-[#034F98]/60
                         transition-colors duration-300 bg-white"
            >
              <div className="mb-4 flex items-center justify-center" style={{ height: 146 }}>
                <Image
                  src={svc.icon}
                  alt={svc.title}
                  width={146}
                  height={146}
                />
              </div>
              <h3 className="section-sub-title text-[#10242b] text-sm font-normal py-3">{svc.title}</h3>
              {svc.shortDescription && (
                <p className="text-gray-500 text-xs mt-2">{svc.shortDescription}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="text-center">
          <Link
            href="/services"
            className="button-section inline-block"            
          >
            DISCOVER MORE
          </Link>
        </div>
      </div>
    </section>
  )
}
