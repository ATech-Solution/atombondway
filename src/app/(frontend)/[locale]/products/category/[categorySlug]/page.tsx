import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600
import { absoluteUrl } from '@/lib/utils'
import PageBanner from '@/components/ui/PageBanner'

const PER_PAGE = 9

type Props = {
  params: Promise<{ locale: string; categorySlug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug } = await params
  const loc = locale as 'en' | 'zh'
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'product-categories', where: { slug: { equals: categorySlug } }, locale: loc, limit: 1 })
    .catch(() => ({ docs: [] }))
  const label = (docs[0] as any)?.title ?? categorySlug
  return {
    title: `${label} | Atom Bondway`,
    description: `Browse all ${label} products from Atom Bondway — official distributor in Hong Kong.`,
    alternates: {
      canonical: absoluteUrl(locale === 'en'
        ? `/products/category/${categorySlug}`
        : `/${locale}/products/category/${categorySlug}`),
    },
  }
}

export default async function ProductCategoryPage({ params, searchParams }: Props) {
  const { locale, categorySlug } = await params
  const { page: pageParam } = await searchParams
  setRequestLocale(locale)

  const loc = locale as 'en' | 'zh'
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  const payload = await getPayloadClient()

  // Look up the category by slug
  const { docs: catDocs } = await payload
    .find({ collection: 'product-categories', where: { slug: { equals: categorySlug } }, locale: loc, limit: 1 })
    .catch(() => ({ docs: [] }))

  if (!catDocs[0]) notFound()
  const categoryLabel: string = (catDocs[0] as any).title ?? categorySlug
  const categoryId: string = (catDocs[0] as any).id

  // Fetch ALL products in this category via relationship ID
  const { docs: allProducts, totalDocs } = await payload
    .find({
      collection: 'products',
      where: { productCategory: { equals: categoryId } },
      sort: 'order',
      limit: 200,
      locale: loc,
    })
    .catch(() => ({ docs: [], totalDocs: 0 }))

  // Group by subcategory preserving insertion order
  const subcategoryMap = new Map<string, any[]>()
  const NO_SUB = '__none__'

  for (const p of allProducts) {
    const sub: string = p.subcategory || NO_SUB
    if (!subcategoryMap.has(sub)) subcategoryMap.set(sub, [])
    subcategoryMap.get(sub)!.push(p)
  }

  const hasSubcategories = subcategoryMap.size > 1 || !subcategoryMap.has(NO_SUB)

  // Flatten all products for pagination (used when NO subcategories)
  const totalPages = Math.ceil(totalDocs / PER_PAGE)
  const showPagination = totalDocs > PER_PAGE

  // For subcategory mode: paginate each section independently
  // For flat mode: paginate the whole list
  const flatProducts = allProducts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const learnMore = loc === 'zh' ? '了解更多' : 'Learn More'

  return (
    <div className="bg-white min-h-screen">
      <PageBanner />

      {/* ── Breadcrumb + page header ── */}
      <div className="border-b border-gray-100 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#034F98] transition-colors">
              {loc === 'zh' ? '首頁' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#034F98] transition-colors">
              {loc === 'zh' ? '產品' : 'Products'}
            </Link>
            <span>/</span>
            <span className="text-[#10242b] font-medium">{categoryLabel}</span>
          </nav>

          <h1 className="section-title text-[#10242b] text-2xl md:text-3xl font-bold">
            {categoryLabel}
          </h1>
          {/* <p className="text-gray-400 text-sm mt-2">
            {totalDocs} {loc === 'zh' ? '個產品' : totalDocs === 1 ? 'product' : 'products'}
          </p> */}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12">

        {allProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-24">
            {loc === 'zh' ? '暫無產品。' : 'No products found.'}
          </p>
        ) : hasSubcategories ? (
          /* ── SUBCATEGORY SECTIONS ── */
          <div className="space-y-16">
            {[...subcategoryMap.entries()].map(([sub, prods]) => {
              const subLabel = sub === NO_SUB ? null : sub
              // Per-subcategory pagination via ?sub=X&page=N — for simplicity show all within section
              // and paginate the whole page together below
              return (
                <section key={sub}>
                  {subLabel && (
                    <h2 className="section-title text-[#10242b] text-xl font-bold mb-8 pb-3">
                      {subLabel}
                    </h2>
                  )}
                  <ProductGrid products={prods} locale={loc} learnMore={learnMore} />
                </section>
              )
            })}
          </div>
        ) : (
          /* ── FLAT PAGINATED LIST ── */
          <ProductGrid products={flatProducts} locale={loc} learnMore={learnMore} />
        )}

        {/* ── Pagination (bottom right) ── */}
        {/* {showPagination && !hasSubcategories && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            categorySlug={categorySlug}
            locale={locale}
          />
        )} */}
      </div>
    </div>
  )
}

/* ── Product grid ── */
function ProductGrid({
  products,
  locale,
  learnMore,
}: {
  products: any[]
  locale: string
  learnMore: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product: any) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}` as any}
          // className="group block"
          className="group flex flex-col h-full min-h-[300px]"
        > 
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50 mb-4 border border-gray-100 transition-shadow duration-300 group-hover:shadow-lg">
            {product.image?.url ? (
              <Image
                src={product.image.url}
                alt={product.image.alt || product.name}
                fill
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {/* Name */}
          <p className="text-[#10242b] font-semibold text-base text-center leading-snug group-hover:text-[#034F98] transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </p>
          <p className="text-gray-400 text-sm text-center mt-1 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.tagline || ''}
          </p>
        </Link>
      ))}
    </div>
  )
}

/* ── Pagination ── */
function Pagination({
  currentPage,
  totalPages,
  categorySlug,
  locale,
}: {
  currentPage: number
  totalPages: number
  categorySlug: string
  locale: string
}) {
  const base = locale === 'en'
    ? `/products/category/${categorySlug}`
    : `/${locale}/products/category/${categorySlug}`

  const pageHref = (p: number) => `${base}?page=${p}`

  // Build page numbers: always show first, last, current ±1, with ellipsis
  const pages: (number | '...')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex justify-end items-center gap-1 mt-14">
      {/* Prev */}
      {currentPage > 1 ? (
        <a
          href={pageHref(currentPage - 1)}
          className="w-9 h-9 flex items-center justify-center border border-gray-200 text-[#10242b] hover:bg-[#034F98] hover:text-white hover:border-[#034F98] transition-colors text-sm"
          aria-label="Previous page"
        >
          ‹
        </a>
      ) : (
        <span className="w-9 h-9 flex items-center justify-center border border-gray-100 text-gray-300 text-sm cursor-default">
          ‹
        </span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
            …
          </span>
        ) : (
          <a
            key={p}
            href={pageHref(p as number)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-9 h-9 flex items-center justify-center border text-sm transition-colors
              ${p === currentPage
                ? 'bg-[#034F98] text-white border-[#034F98] font-semibold'
                : 'border-gray-200 text-[#10242b] hover:bg-[#034F98] hover:text-white hover:border-[#034F98]'
              }`}
          >
            {p}
          </a>
        )
      )}

      {/* Next */}
      {/* {currentPage < totalPages ? (
        <a
          href={pageHref(currentPage + 1)}
          className="w-9 h-9 flex items-center justify-center border border-gray-200 text-[#10242b] hover:bg-[#034F98] hover:text-white hover:border-[#034F98] transition-colors text-sm"
          aria-label="Next page"
        >
          ›
        </a>
      ) : (
        <span className="w-9 h-9 flex items-center justify-center border border-gray-100 text-gray-300 text-sm cursor-default">
          ›
        </span>
      )} */}
    </div>
  )
}
