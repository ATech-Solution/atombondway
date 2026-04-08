import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getMediaUrl } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, { en: string; zh: string; image: string }> = {
  'silicone-sealants': { en: 'SILICONE SEALANTS', zh: '陶氏密封膠', image: '/images/product-sealants.jpg' },
  'spacer-tapes':      { en: 'SPACER TAPES',      zh: '間隔膠帶',   image: '/images/product-tapes.jpg' },
  'suction-grip':      { en: 'SUCTION GRIPS',     zh: '吸盤工具',   image: '/images/product-suction.jpg' },
  'backer-rod':        { en: 'BACKER ROD',         zh: '背襯帶',     image: '/images/product-tapes.jpg' },
}

interface Props {
  products: any[]
  locale: string
  homePageData?: any
}

export default function FeaturedProductsSection({ products, locale, homePageData }: Props) {
  const loc = locale as 'en' | 'zh'
  const mode = homePageData?.featuredProductsMode || 'featured_products'
  const sectionTitle = homePageData?.featuredProductsTitle || 'OUR FEATURED PRODUCTS'

  // ── Option 2: Category links ─────────────────────────────────────────────
  if (mode === 'category_links') {
    const categoryLinks: any[] = homePageData?.featuredCategoryLinks || []

    // Fallback to default 3 categories if none configured
    const items = categoryLinks.length > 0
      ? categoryLinks
      : [
          { categorySlug: 'silicone-sealants' },
          { categorySlug: 'spacer-tapes' },
          { categorySlug: 'suction-grip' },
        ]

    return (
      <section className="py-16" style={{ backgroundColor: '#3a648c' }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="section-title-light text-2xl font-normal uppercase tracking-wide">
              {sectionTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.slice(0, 3).map((item: any, idx: number) => {
              const slug = item.categorySlug || 'silicone-sealants'
              const catInfo = CATEGORY_LABELS[slug]
              const label = item.label || (loc === 'zh' ? catInfo?.zh : catInfo?.en) || slug
              const imgSrc = getMediaUrl(item.image) || catInfo?.image || '/images/product-sealants.jpg'
              return (
                <div key={idx} className="flex flex-col">
                  <Link
                    href={`/products/category/${slug}` as any}
                    className="group block relative overflow-hidden bg-white/10"
                    style={{ height: 280 }}
                  >
                    <Image
                      src={imgSrc}
                      alt={label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width:640px)100vw,(max-width:1024px)33vw,33vw"
                    />
                    <div className="absolute inset-0 bg-[#3c97eb]/0 group-hover:bg-[#034F98]/10 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-[#3c97eb] hover:bg-[#3a648c] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                  <div className="py-3 border-b border-white/20">
                    <h3 className="section-title-light text-base font-normal text-center">{label}</h3>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── Option 1: Featured products ──────────────────────────────────────────
  const FALLBACK_PRODUCTS = [
    { id: 'f1', slug: 'silicone-sealants', name: '陶氏密封膠', nameEn: 'SILICONE SEALANTS', image: '/images/product-sealants.jpg' },
    { id: 'f2', slug: 'adhesive-tapes',    name: '間隔膠帶',   nameEn: 'SPACER TAPES',      image: '/images/product-tapes.jpg' },
    { id: 'f3', slug: 'suction-cups',      name: '吸盤工具',   nameEn: 'SUCTION GRIPS',     image: '/images/product-suction.jpg' },
  ]
  const items = products?.length ? products : FALLBACK_PRODUCTS

  return (
    <section className="py-16" style={{ backgroundColor: '#3a648c' }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-10">
          <h2 className="section-title-light text-2xl font-normal uppercase tracking-wide">
            {sectionTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.slice(0, 3).map((prod: any, idx: number) => {
            const fallbackImgs = ['/images/product-sealants.jpg', '/images/product-tapes.jpg', '/images/product-suction.jpg']
            const imgSrc = getMediaUrl(prod.image) || prod.image || fallbackImgs[idx] || fallbackImgs[0]
            const name = loc === 'zh' ? (prod.name || prod.nameEn || 'Product') : (prod.nameEn || prod.name || 'Product')
            const slug = prod.slug || '#'
            return (
              <div key={prod.id} className="flex flex-col">
                <Link
                  href={slug !== '#' ? (`/products/${slug}` as any) : ('/products' as any)}
                  className="group block relative overflow-hidden bg-white/10"
                  style={{ height: 280 }}
                >
                  <Image
                    src={imgSrc}
                    alt={prod.image?.alt || name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px)100vw,(max-width:1024px)33vw,33vw"
                  />
                  <div className="absolute inset-0 bg-[#3c97eb]/0 group-hover:bg-[#034F98]/20 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#3c97eb] hover:bg-[#3a648c] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                  </div>
                </Link>
                <div className="py-3 border-b border-white/20">
                  <h3 className="section-title-light text-base font-normal text-center">{name}</h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
