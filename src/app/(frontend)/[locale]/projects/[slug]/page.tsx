import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { buildSeoMetadata } from '@/lib/seo'
import { Link } from '@/i18n/navigation'
import PageBanner from '@/components/ui/PageBanner'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'projects', where: { slug: { equals: slug } }, locale: locale as 'en' | 'zh', limit: 1 })
    .catch(() => ({ docs: [] }))

  if (!docs[0]) return { title: 'Project Not Found' }
  const project = docs[0] as any

  return buildSeoMetadata({
    locale,
    path: `/projects/${slug}`,
    meta: {
      ...project.meta,
      ogImage: project.meta?.ogImage ?? project.coverImage,
    },
    fallbackTitle: project.title,
    fallbackDescription: project.summary,
  })
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'projects', where: { slug: { equals: slug } }, locale: locale as 'en' | 'zh', depth: 2, limit: 1 })
    .catch(() => ({ docs: [] }))

  if (!docs[0]) notFound()
  const project = docs[0] as any

  const isZh = locale === 'zh'

  // Collect all images: coverImage + gallery
  const allImages: { url: string; alt: string }[] = []
  if (project.coverImage?.url) allImages.push({ url: project.coverImage.url, alt: project.coverImage.alt || project.title })
  if (project.gallery?.length) {
    project.gallery.forEach((g: any) => {
      if (g.image?.url) allImages.push({ url: g.image.url, alt: g.image.alt || project.title })
    })
  }

  // Metadata rows (right column) — only show if value exists
  const meta: { label: string; value: string }[] = []
  if (project.architect)        meta.push({ label: isZh ? '建築師' : 'Architect',         value: project.architect })
  if (project.developer)        meta.push({ label: isZh ? '發展商' : 'Developer',          value: project.developer })
  if (project.materialSupplied) meta.push({ label: isZh ? '供應材料' : 'Material Supplied', value: project.materialSupplied })
  if (project.buildingType)     meta.push({ label: isZh ? '建築類型' : 'Building Type',     value: project.buildingType })
  const catTitle = typeof project.projectCategory === 'object' ? project.projectCategory?.title : null
  if (catTitle)                 meta.push({ label: isZh ? '類別' : 'Category',             value: catTitle })

  return (
    <div className="bg-white">
      {/* Top banner */}
      <PageBanner />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12 md:py-16">
        <h1 className="page-title page-title font-bold text-[#10242b] mb-4">{project.title}</h1>

        {/* Main content: images left, metadata right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Images — left (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            {allImages.length === 0 ? (
              <div className="bg-gray-100 rounded w-full" style={{ height: 300 }} />
            ) : allImages.length === 1 ? (
              <div className="relative w-full overflow-hidden rounded" style={{ height: 420 }}>
                <Image src={allImages[0].url} alt={allImages[0].alt} fill className="object-cover" priority sizes="(max-width:768px)100vw,60vw" />
              </div>
            ) : (
              <>
                {/* First image large */}
                <div className="relative w-full overflow-hidden rounded" style={{ height: 340 }}>
                  <Image src={allImages[0].url} alt={allImages[0].alt} fill className="object-cover" priority sizes="(max-width:768px)100vw,60vw" />
                </div>
                {/* Remaining in 2-col grid */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    {allImages.slice(1).map((img, i) => (
                      <div key={i} className="relative overflow-hidden rounded" style={{ height: 200 }}>
                        <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="(max-width:768px)50vw,30vw" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Metadata — right (4 cols) */}
          {meta.length > 0 && (
            <div className="md:col-span-4">
              <dl className="space-y-4 text-sm">
                {meta.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="font-semibold text-[#10242b] mb-0.5">{label}</dt>
                    <dd className="text-gray-600 leading-snug">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Description */}
        {project.summary && (
          <p className="mt-10 text-gray-600 text-sm leading-relaxed max-w-3xl">{project.summary}</p>
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/projects" className="text-[#034F98] hover:text-[#023874] text-sm font-medium transition-colors">
            ← {isZh ? '返回項目列表' : 'BACK'}
          </Link>
        </div>
      </div>
    </div>
  )
}
