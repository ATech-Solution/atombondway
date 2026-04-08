import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { absoluteUrl } from '@/lib/utils'
import SectionHeading from '@/components/ui/SectionHeading'
import PageBanner from '@/components/ui/PageBanner'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const loc = locale as 'en' | 'zh'

  const [page, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'projects-page', locale: loc }).catch(() => null),
    payload.findGlobal({ slug: 'site-settings', locale: loc }).catch(() => null),
  ])

  const meta = (page as any)?.meta
  const defaultMeta = (siteSettings as any)?.defaultMeta
  const pageTitle = (page as any)?.pageTitle || (loc === 'zh' ? '我們的項目' : 'Our Projects')
  const pageSubtitle = (page as any)?.pageSubtitle || ''

  return {
    title: meta?.title || pageTitle,
    description: meta?.description || pageSubtitle || defaultMeta?.description,
    keywords: meta?.keywords || defaultMeta?.keywords,
    alternates: {
      canonical: absoluteUrl(locale === 'en' ? '/projects' : `/${locale}/projects`),
      languages: { en: absoluteUrl('/projects'), zh: absoluteUrl('/zh/projects') },
    },
    openGraph: {
      title: meta?.title || pageTitle,
      description: meta?.description || pageSubtitle || '',
      images: meta?.ogImage?.url ? [meta.ogImage.url] : [],
    },
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const loc = locale as 'en' | 'zh'

  const [page, { docs: projects }] = await Promise.all([
    payload.findGlobal({ slug: 'projects-page', locale: loc }).catch(() => null),
    payload
      .find({ collection: 'projects', sort: 'order', limit: 50, locale: loc, depth: 1 })
      .catch(() => ({ docs: [] })),
  ])

  const pageTitle = (page as any)?.pageTitle || (loc === 'zh' ? '我們的項目' : 'Our Projects')
  const pageSubtitle = (page as any)?.pageSubtitle || ''
  const readMore = loc === 'zh' ? '閱讀更多' : 'Read More'
  const noProjects = loc === 'zh' ? '暫無項目。' : 'No projects yet.'

  return (
    <div className="bg-white">
      <PageBanner />
      <section className="section-pys bg-white">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12 md:py-16">
        <h1 className="page-title font-bold text-[#10242b] text-center mb-4">{pageTitle}</h1>
        {/* {pageSubtitle && <p className="text-[#000] text-center py-3">{pageSubtitle}</p>} */}

        {projects.length === 0 ? (
          <p className="text-center text-gray-500 py-16">{noProjects}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group block bg-white overflow-hidden shadow-md card-hover"
              >
                {/* rounded-xl  */}
                <div className="relative h-60 w-full overflow-hidden">
                  {project.coverImage?.url ? (
                    <Image
                      src={project.coverImage.url}
                      alt={project.coverImage.alt || project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  {project.projectCategory && typeof project.projectCategory === 'object' && (
                    <span className="absolute top-3 left-3 bg-[#034F98] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {project.projectCategory.title}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#10242b] text-lg mb-2 group-hover:text-[#034F98] transition-colors">
                    {project.title}
                  </h3>
                  {project.summary && (
                    <p className="text-gray-500 text-sm line-clamp-2">{project.summary}</p>
                  )}
                  <div className="mt-4 flex items-center text-[#034F98] text-sm font-semibold">
                    {readMore} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
    </div>
  )
}
