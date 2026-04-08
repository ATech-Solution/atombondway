import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { absoluteUrl } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import RichText from '@/components/ui/RichText'
import PageBanner from '@/components/ui/PageBanner'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'products', where: { slug: { equals: slug } }, locale: locale as 'en' | 'zh', limit: 1 })
    .catch(() => ({ docs: [] }))
  if (!docs[0]) return { title: 'Product Not Found' }
  const product = docs[0] as any
  return {
    title: product.meta?.title || product.name,
    description: product.meta?.description || product.tagline,
    openGraph: { images: product.image?.url ? [product.image.url] : [] },
    alternates: { canonical: absoluteUrl(locale === 'en' ? `/products/${slug}` : `/${locale}/products/${slug}`) },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({
      collection: 'products',
      where: { slug: { equals: slug } },
      locale: locale as 'en' | 'zh',
      depth: 2,
      limit: 1,
    })
    .catch(() => ({ docs: [] }))

  if (!docs[0]) notFound()
  const product = docs[0] as any
  const isZh = locale === 'zh'

  // Resolve internal Lexical link references (media IDs → URLs)
  if (product.description?.root?.children) {
    const mediaIds = new Set<number>()
    function collectMediaIds(nodes: any[]) {
      for (const n of nodes) {
        if (n.type === 'link' && n.fields?.linkType === 'internal' && n.fields?.doc?.relationTo === 'media') {
          const v = n.fields.doc.value
          if (typeof v === 'number') mediaIds.add(v)
        }
        if (n.children) collectMediaIds(n.children)
      }
    }
    collectMediaIds(product.description.root.children)

    if (mediaIds.size > 0) {
      const mediaResults = await payload
        .find({ collection: 'media', where: { id: { in: [...mediaIds] } }, limit: mediaIds.size })
        .catch(() => ({ docs: [] }))
      const mediaMap = new Map(mediaResults.docs.map((m: any) => [m.id, m]))

      function populateLinks(nodes: any[]) {
        for (const n of nodes) {
          if (n.type === 'link' && n.fields?.linkType === 'internal' && n.fields?.doc?.relationTo === 'media') {
            const v = n.fields.doc.value
            if (typeof v === 'number' && mediaMap.has(v)) {
              n.fields.doc.value = mediaMap.get(v)
            }
          }
          if (n.children) populateLinks(n.children)
        }
      }
      populateLinks(product.description.root.children)
    }
  }

  // Resolve category from relationship (depth:2 populates it)
  const cat = product.productCategory
  const catTitle: string = typeof cat === 'object' ? cat?.title || '' : ''
  const catSlug: string  = typeof cat === 'object' ? cat?.slug  || '' : ''

  return (
    <div className="bg-white">
      <PageBanner />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#034F98] transition-colors">{isZh ? '首頁' : 'Home'}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#034F98] transition-colors">{isZh ? '產品' : 'Products'}</Link>
          {catTitle && (
            <>
              <span>/</span>
              {catSlug ? (
                <Link href={`/products/category/${catSlug}` as any} className="hover:text-[#034F98] transition-colors">
                  {catTitle}
                </Link>
              ) : (
                <span>{catTitle}</span>
              )}
            </>
          )}
          <span>/</span>
          <span className="text-[#10242b] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

          {/* Image — left */}
          <div className="md:col-span-5">
            <div className="relative w-full overflow-hidden bg-gray-50 border border-gray-100">
              {product.image?.url ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt || product.name}
                  width={product.image.width || 800}
                  height={product.image.height || 800}
                  className="object-contain w-full h-auto p-8"
                  priority
                  sizes="(max-width:768px)100vw,42vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {product.gallery?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {product.gallery.map((item: any, i: number) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded border border-gray-100 bg-gray-50">
                    <Image src={item.image.url} alt={item.image.alt || `Image ${i + 1}`} fill className="object-contain p-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info — right */}
          <div className="md:col-span-7">
            {catTitle && (
              <p className="text-[#034F98] text-xs font-semibold uppercase tracking-widest mb-2 pb-2">{catTitle}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-[#10242b] mb-4 pb-10 leading-snug">{product.name}</h1>

            {product.tagline && (
              <p className="text-gray-500 text-base mb-6 leading-relaxed">{product.tagline}</p>
            )}

            {product.description && (
              <div className="rich-text">
                <RichText data={product.description} />
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/products" className="text-[#034F98] hover:text-[#023874] text-sm font-medium transition-colors">
            ← {isZh ? '返回產品列表' : 'BACK'}
          </Link>
        </div>
      </div>
    </div>
  )
}
