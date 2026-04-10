import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface Props { 
  locale: string; 
  homePageData: any 
}

export default function HeroSection({ locale, homePageData }: Props) {
  // const heading = data?.heading || 'WE SEAL THE SUCCESS OF HONG KONG'
  // const cta1    = data?.ctaPrimary

  const heading    = homePageData?.heroSectionTitle || 'WE SEAL THE SUCCESS OF HONG KONG'
  const cta1       = {
    text: homePageData?.heroSectionCtaText || 'TELL ME MORE',
    href: homePageData?.heroSectionCtaHref || '/about',
  }
  const bgImage   = homePageData?.heroSectionbackgroundImage?.url || '/images/hero-bg.jpg'
  const overlayOpacity = homePageData?.heroSectionoverlayOpacity ?? 50

  return (
    <section className="relative w-full" style={{ minHeight: 706 }}>
      {/* Background image */}
      <Image
        src={bgImage}
        alt="Hero background"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      {/* Dark overlay — gradient from left for text legibility */}
      <div className="absolute inset-0" style={{ opacity: overlayOpacity / 100, background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.22) 100%)' }} />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-start justify-center"
        style={{ minHeight: 560, paddingLeft: '8%', paddingRight: '8%', paddingTop: 60, paddingBottom: 80 }}
      >
        <h1
          className="section-title-light font-normal"
          //  max-w-xl
          style={{ fontSize: 'clamp(28px, 3.5vw, 43px)', lineHeight: 1.2, marginBottom: 40 }}
        >
          {heading}
        </h1>
        <Link
          href={((cta1?.href || '/about') as any)}
          className="button-section button-hero inline-block duration-200 tracking-widest"
        >
          {cta1?.text || 'TELL ME MORE'}
        </Link>
      </div>
    </section>
  )
}
