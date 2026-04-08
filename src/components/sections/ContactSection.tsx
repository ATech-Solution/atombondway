import Image from 'next/image'
import ContactForm from '@/components/forms/ContactForm'

interface Props { data: any; locale: string; fullPage?: boolean }

export default async function ContactSection({ data, locale, fullPage }: Props) {
  const address      = data?.address || ''
  const email        = data?.email   || ''
  const phone        = data?.phone   || ''
  const fax          = data?.fax     || ''
  const showForm     = data?.contactFormEnabled !== false
  const mapsUrl      = 'https://www.google.com/maps/place/Yam+Tze+Commercial+Building,+17-23+Thomson+Rd,+Wan+Chai/@22.2772118,114.1688945,17z'

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Left: section title */}
          <div className="md:col-span-3">
            <h2 className="section-title text-[#10242b] text-2xl font-normal">
              {locale === 'zh' ? '聯絡我們' : 'CONTACT US'}
            </h2>
          </div>

          {/* Right: pin image + contact info */}
          <div className="md:col-span-9">
            <div className="flex items-start gap-6">
              {/* Location pin — clickable to Google Maps */}
              {/* <a
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
                />
              </a> */}

              {/* Contact details */}
              <div className="flex flex-col gap-2 text-[#212529] text-base">
                {address && <p>{address}</p>}
                {email && (
                  <a href={`mailto:${email}`} className="text-[#034F98] hover:text-[#023874]">
                    {email}
                  </a>
                )}
                {(phone || fax) && (
                  <p>
                    {phone && <>Tel: <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-[#034F98]">{phone}</a></>}
                    {phone && fax && ' / '}
                    {fax && <>Fax: {fax}</>}
                  </p>
                )}
              </div>
            </div>

            {/* Google Maps iframe */}
            {data?.mapEmbedUrl && (
              <div className="mt-8 rounded overflow-hidden" style={{ height: 300 }}>
                <iframe
                  src={data.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office location"
                />
              </div>
            )}

            {/* Contact form (only on full contact page) */}
            {fullPage && showForm && (
              <div className="mt-10 bg-[#f5f5f5] rounded p-8">
                <h3 className="text-[#10242b] text-lg font-semibold mb-6">
                  {locale === 'zh' ? '發送訊息' : 'Send a Message'}
                </h3>
                <ContactForm locale={locale} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
