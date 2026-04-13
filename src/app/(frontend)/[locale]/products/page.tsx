import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { buildSeoMetadata } from '@/lib/seo'
import PageBanner from '@/components/ui/PageBanner'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const loc = locale as 'en' | 'zh'

  const [page, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'products-page', locale: loc }).catch(() => null),
    payload.findGlobal({ slug: 'site-settings', locale: loc }).catch(() => null),
  ])

  const p = page as any
  const ss = siteSettings as any

  return buildSeoMetadata({
    locale,
    path: '/products',
    meta: p?.meta,
    defaults: { ...ss?.defaultMeta, noindex: ss?.noindex, companyName: ss?.companyName },
    fallbackTitle: p?.pageTitle || (loc === 'zh' ? '我們的產品' : 'Our Products'),
    fallbackDescription: p?.pageSubtitle,
  })
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const loc = locale as 'en' | 'zh'

  const [page, { docs: categories }, { docs: products }] = await Promise.all([
    payload.findGlobal({ slug: 'products-page', locale: loc }).catch(() => null),
    payload.find({ collection: 'product-categories', sort: 'order', limit: 50, locale: loc }).catch(() => ({ docs: [] })),
    payload.find({ collection: 'products', sort: 'order', limit: 200, locale: loc, depth: 1 }).catch(() => ({ docs: [] })),
  ])

  const pageTitle = (page as any)?.pageTitle || (loc === 'zh' ? '我們的產品' : 'Our Products')
  const pageSubtitle = (page as any)?.pageSubtitle || ''

  // Group products by productCategory slug
  const grouped = new Map<string, { title: string; slug: string; products: any[] }>()

  // Pre-populate in canonical order from categories collection
  categories.forEach((cat: any) => {
    grouped.set(cat.slug, { title: cat.title, slug: cat.slug, products: [] })
  })

  products.forEach((p: any) => {
    const cat = p.productCategory
    const slug: string = typeof cat === 'object' ? cat?.slug || '' : ''
    const title: string = typeof cat === 'object' ? cat?.title || (loc === 'zh' ? '其他' : 'Other') : (loc === 'zh' ? '其他' : 'Other')
    if (!slug) return // skip uncategorised
    if (!grouped.has(slug)) grouped.set(slug, { title, slug, products: [] })
    grouped.get(slug)!.products.push(p)
  })

  // Filter out empty categories and excluded slugs
  const catSections = [...grouped.values()].filter(c => c.products.length > 0 && c.slug !== 'backer-rod')

  return (
    <div className="bg-white min-h-screen">
      <PageBanner />
      {/* ── Page header ── */}
      <div className="border-b border-gray-100 bg-[#f8f9fb]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="mb-12">
            <h1 className="page-title-have-into font-bold text-[#10242b] text-center">{pageTitle}</h1>
            {pageSubtitle && (<p className="text-[#000] text-center py-3">{pageSubtitle}</p>)}
          </div>

          {/* Category quick-links → dedicated category pages */}
          {catSections.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-8 justify-center">
              {catSections.map(({ title, slug }) => (
                <Link
                  key={slug}
                  href={`/products/category/${slug}` as any}
                  className="inline-flex items-center px-4 py-2 text-base font-semibold border-2 
                  border-[#034F98] text-[#fff] hover:bg-[#3c97eb] hover:text-white transition-colors duration-200 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034F98] focus-visible:ring-offset-2"
                >
                  {title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Category sections ── */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-20">
        {catSections.length === 0 ? (
          <p className="text-center text-gray-400 py-20">{loc === 'zh' ? '暫無產品。' : 'No products yet.'}</p>
        ) : (
          catSections.map(({ title, slug, products: prods }) => (
            <section key={slug} id={slug} className="scroll-mt-24">
              <h2 className="section-title text-2xl md:text-3xl font-bold text-[#10242b] mb-10">
                {title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {prods.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-50 mb-4 border border-gray-100 transition-shadow duration-300 group-hover:shadow-lg">
                      {product.image?.url ? (
                        <Image
                          src={product.image.url}
                          alt={product.image.alt || product.name}
                          fill
                          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-[#10242b] font-semibold text-base text-center leading-snug group-hover:text-[#034F98] transition-colors duration-200">
                      {product.name}
                    </p>
                    {product.tagline && (
                      <p className="text-gray-400 text-sm text-center mt-1 line-clamp-2 leading-snug">
                        {product.tagline}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
