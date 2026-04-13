'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUp } from 'lucide-react'
import { useLocale } from 'next-intl'

interface Props {
  siteSettings: any
  footerSettings: any
  locale: string
}

const MAPS_URL =
  'https://www.google.com/maps/place/Yam+Tze+Commercial+Building,+17-23+Thomson+Rd,+Wan+Chai/@22.2772118,114.1688945,17z'

export default function Footer({ siteSettings, footerSettings, locale }: Props) {
  const [visible, setVisible] = useState(false)
  const currentLocale = useLocale()
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const title = footerSettings?.title || 'Contact Us'
  const address = footerSettings?.address || 'address'
  const phone   = footerSettings?.phone || 'phone'
  const fax     = footerSettings?.fax || 'fax'
  const email   = footerSettings?.email || 'email'
  const mapsUrl = 'https://www.google.com/maps/place/Yam+Tze+Commercial+Building,+17-23+Thomson+Rd,+Wan+Chai/@22.2772118,114.1688945,17z'
  const showContactInfo = footerSettings?.showContactInfo !== false && (address || phone || fax || email)
  const year        = new Date().getFullYear()
  const companyName = siteSettings?.companyName || 'Atom Bondway Company Limited'
  const copyright   =
    footerSettings?.copyrightText ||
    siteSettings?.footer?.copyrightText ||
    `© ${year} ${companyName}. All Rights Reserved.`
  const showBackToTop = footerSettings?.showBackToTop !== false
  const telText = currentLocale === 'zh' ? '電話.' : 'Tel.'
  const faxText = currentLocale === 'zh' ? '傳真.' : 'Fax.'

  return (
    <footer>
      {/* Top contact info */}
      {showContactInfo && (<>
      {/* ── Top: Contact Us ── */}
        <div className="footer-top">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

              {/* Left: heading */}
              <div className="md:col-span-3">
                <h2 className="section-title text-[#10242b] text-2xl font-normal">
                  {title}
                </h2>
              </div>

              {/* Right: pin + details */}
              <div className="md:col-span-9">
                <div className="flex items-start gap-6">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/images/contact-pin.jpg"
                      alt="Location"
                      width={35}
                      height={53}
                      className="object-contain"
                      style={{ height: 'auto' }}
                    />
                  </a>

                  <div className="flex flex-col gap-2 text-[#000]">
                    {address && <p className="whitespace-pre-line">{address}</p>}
                    {email && (
                      <a href={`mailto:${email}`} className="text-[#034F98] hover:text-[#023874] transition-colors">
                        {email}
                      </a>
                    )}
                    {(phone || fax) && (
                      <p>
                        {phone && <>
                          {telText} 
                          <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-[#034F98] transition-colors">{phone}</a></>}
                        {phone && fax && ' / '}
                        {fax && <>
                          {faxText} 
                          {fax}</>}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      )}

      {/* ── Copyright ── */}
      <div className="footer-copyright">
        <div className={`max-w-[1200px] mx-auto px-4 py-4 ${showContactInfo ? 'border-t-2 border-t border-[#a1a1a1] border-2' : 'no-border-t'}`}>
          <p className="text-center sm:text-left">
            {copyright}
          </p>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className={`back-to-top fixed bottom-6 right-6 z-50 text-[#fff] hover:text-white bg-[#3c97eb] hover:bg-[#3a648c] rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <ArrowUp size={18} />
        </button>
      )}
    </footer>
  )
}