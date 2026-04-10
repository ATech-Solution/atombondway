import { Link } from '@/i18n/navigation'
import RichText from '@/components/ui/RichText'

interface Props { 
  locale: any; 
  homePageData?: any 
}

const ABOUT_TEXT_ZH = '力新邦威有限公司是優質幕牆建築工程材料的官方香港經銷商。於2001年成立，多年來一直致力與主要伙伴緊密合作，以安全、可靠及專業為宗旨，為客戶提供頂級的幕牆系統及結構密封服務。'
const ABOUT_TEXT_EN = 'Atom Bondway Company Limited is the official distributor of high-performance building materials for curtain wall facade projects in Hong Kong. Founded in 2001, Atom Bondway works closely with our major brand partners to provide top quality services and products to our valued customers. With over a decade of service, Atom Bondway delivers Safety, Trust, and Professionalism.'

export default async function AboutSection({ locale, homePageData }: Props) {
  // const locale = (data as any)?._locale || 'en'

  // const heading  = data?.heading || (locale === 'zh' ? '關於力新邦威' : 'ABOUT US')
  // const body     = data?.body
  // const hasBody  = body?.root?.children?.length > 0

  const heading    = homePageData?.aboutSectionTitle || 'ABOUT US'
  const body       = homePageData?.aboutSectionBody  ||  'Atom Bondway Company Limited is the official distributor of high-performance building materials for curtain wall facade projects in Hong Kong. Founded in 2001, Atom Bondway works closely with our major brand partners to provide top quality services and products to our valued customers. With over a decade of service, Atom Bondway delivers Safety, Trust, and Professionalism.'
  const ctaText    = homePageData?.aboutSectionCtaText      || 'DISCOVER MORE'
  const ctaHref    = homePageData?.aboutSectionCtaHref      || '/about'

  return (
    <section className="about-section py-20 bg-[#3a648c]">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Left: section title */}
          <div className="md:col-span-3">
            <h2 className="section-title-light text-2xl font-normal">
              {heading}
            </h2>
          </div>

          {/* Right: body text + CTA */}
          <div className="md:col-span-9">
            {/* {hasBody ? ( */}
              <div className="rich-text-light text-base leading-relaxed mb-6">
                <RichText data={body} />
              </div>
            {/* ) : (
              <p className="rich-text-light text-base leading-relaxed mb-6">
                {locale === 'zh' ? ABOUT_TEXT_ZH : ABOUT_TEXT_EN}
              </p>
            )} */}

            {/* {!fullPage && ( */}
              <Link
                href={ctaHref as any}
                className="button-section"
              >
                {ctaText}
              </Link>
            {/* )} */}
          </div>
        </div>
      </div>
    </section>
  )
}
