import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { absoluteUrl } from '@/lib/utils'
import ContactSection from '@/components/sections/ContactSection'
import PageBanner from '@/components/ui/PageBanner'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const t = await getTranslations({ locale, namespace: 'contact' })
  const contact = await payload
    .findGlobal({ slug: 'contact-info', locale: locale as 'en' | 'zh' })
    .catch(() => null)
  const meta = (contact as any)?.meta

  return {
    title: meta?.title || t('pageTitle'),
    description: meta?.description || t('pageSubtitle'),
    alternates: {
      canonical: absoluteUrl(locale === 'en' ? '/contact' : `/${locale}/contact`),
      languages: { en: absoluteUrl('/contact'), zh: absoluteUrl('/zh/contact') },
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const contact = await payload
    .findGlobal({ slug: 'contact-info', locale: locale as 'en' | 'zh' })
    .catch(() => null)

  return (
    <div>
      <PageBanner />
      <ContactSection data={contact} locale={locale} fullPage />
    </div>
  )
}
