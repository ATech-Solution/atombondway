'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useTransition } from 'react'

interface NavItem {
  label: string
  href: string
  openInNewTab?: boolean
  children?: NavItem[]
}

interface Props {
  siteSettings: any
  navigation: any
  contactInfo: any
  locale: string
}

// Fixed product submenu per locale — anchors match products page section IDs
const PRODUCT_CHILDREN: Record<string, NavItem[]> = {
  en: [
    { label: 'DOWSIL™ SEALANTS',         href: '/products/category/silicone-sealants' },
    { label: 'SAINT GOBAIN SPACER TAPES', href: '/products/category/spacer-tapes' },
    { label: "WOOD'S POWR-GRIP",          href: '/products/category/suction-grip' },
    // BACKER ROD hidden per spec
  ],
  zh: [
    { label: '陶氏密封膠', href: '/products/category/silicone-sealants' },
    { label: '粘接膠帶',   href: '/products/category/spacer-tapes' },
    { label: '吸盤',       href: '/products/category/suction-grip' },
    // atomcell 背襯帶 hidden per spec
  ],
}

const LANG_LABELS: Record<string, string> = {
  zh: '中文 (香港)',
  en: 'ENGLISH',
}

export default function Header({ siteSettings, navigation, locale }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileProductOpen, setMobileProductOpen] = useState(false)
  const [mobileLangOpen, setMobileLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logo = siteSettings?.logo?.url || '/images/logo.png'
  const companyName = siteSettings?.companyName || 'Atom Bondway Company Limited'
  const stickyHeader = siteSettings?.stickyHeader || false
  const switchLocale = (next: string) => {
    startTransition(() => { router.replace(pathname, { locale: next }) })
  }

  // Build nav items — inject product children, strip locale from CMS nav
  const cmsItems: NavItem[] = navigation?.items || []
  // console.log('CMS nav items:', JSON.stringify(cmsItems))
  const navItems: NavItem[] = cmsItems.length
    ? cmsItems
        // .filter((item: NavItem) => item.href !== '/contact') // keep contact out of main nav if present
        .map((item: NavItem) => {
          // if (item.href === '/products') {
          //   return { ...item, children: PRODUCT_CHILDREN[locale] ?? PRODUCT_CHILDREN.en }
          // }
          return item
        })
    : [
        // { label: locale === 'zh' ? '主頁'     : 'Home',       href: '/' },
        // { label: locale === 'zh' ? '產品'     : 'Products',   href: '/products', children: PRODUCT_CHILDREN[locale] },
        // { label: locale === 'zh' ? '專案'     : 'Projects',   href: '/projects' },
        // { label: locale === 'zh' ? '服務'     : 'Services',   href: '/services' },
        // { label: locale === 'zh' ? '關於我們' : 'About Us',   href: '/about' },
        // { label: locale === 'zh' ? '聯繫我們' : 'Contact',    href: '/contact' },
      ]

  // All locales for language switcher dropdown
  const allLocales = [
    { code: 'zh', label: '中文 (香港)' },
    { code: 'en', label: 'ENGLISH' },
  ]
  const otherLocales = allLocales.filter(l => l.code !== currentLocale)

  const isActive = (href: string) => {
    const base = href.split('#')[0]
    return base === '/' ? pathname === '/' : pathname.startsWith(base)
  }
  return (
    <header suppressHydrationWarning 
    className={`${stickyHeader ? 'sticky top-0 z-50' : 'top-0 z-50'} bg-white 
    ${stickyHeader ? `transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}` : 'shadow-sm'}`}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[80px] lg:h-[109px]">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center" style={{ maxWidth: 323 }}>
            <Image
              src={logo}
              alt={companyName}
              width={323}
              height={50}
              className="h-[48px] w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => (
              <div key={item.href + item.label} className="relative group">
                <Link
                  href={item.href as any}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className={`nav-link ${isActive(item.href) ? 'nav-link--active' : ''} flex items-center gap-1 px-4 py-2 font-normal transition-colors duration-150`}
                >
                  {item.label}
                  {item.children?.length ? <ChevronDown size={14} className="opacity-60" /> : null}
                </Link>

                {/* Products dropdown */}
                {item.children?.length ? (
                  <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-100 shadow-lg min-w-[220px] z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href + child.label}
                        href={child.href as any}
                        className={`block px-5 py-2.5 text-sm text-light 
                        ${isActive(child.href) ? 'bg-[#3a648c]' : 'bg-[#3c97eb] '} 
                        hover:bg-[#3a648c] hover:text-light transition-colors`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {/* Language switcher — styled as nav item with dropdown */}
            <div className="relative group border-l border-gray-200">
              <button
                className="nav-link flex items-center gap-1 px-4 py-2 font-normal text-[#3c97eb] hover:text-[#034F98] transition-colors duration-150"
                disabled={isPending}
              >
                {LANG_LABELS[currentLocale]}
                <ChevronDown size={14} className="opacity-60" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-[#3c97eb] border border-gray-100 shadow-lg z-50">
                {otherLocales.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLocale(lang.code)}
                    disabled={isPending}
                    className="w-full text-center block px-5 py-2.5 text-sm min-w-[85px] text-white bg-[#3c97eb] hover:text-white hover:bg-[#3a648c] transition-colors"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#212529] hover:text-[#034F98]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg px-5 pb-2">
          <nav className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col">
            {navItems.map((item) => (
              <div key={item.href + item.label}>
                {item.children?.length ? (
                  <>
                    <button
                      onClick={() => setMobileProductOpen(!mobileProductOpen)}
                      className="uppercase min-w-[330px] flex items-center justify-between mt-3 mb-3 ml-3 px-3 py-3 text-left text-[#212529] hover:text-[#034F98] font-normal"
                    >
                      {item.label}
                      <ChevronDown size={16} className={`transition-transform ${mobileProductOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileProductOpen && (
                      <div className="uppercase pl-5 flex flex-col gap-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href + child.label}
                            href={child.href as any}
                            className="block px-3 py-2 text-sm text-[#4d4d4d] hover:text-[#034F98]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href as any}
                    className={`uppercase block px-3 py-3 text-[#212529] hover:text-[#034F98] font-normal
                      ${isActive(item.href) ? 'text-[#034F98]' : ''}`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile language switcher */}
            <div className="border-t border-gray-100 mt-2 pt-2 ml-3 pr-3 py-3">
              <button
                onClick={() => setMobileLangOpen(!mobileLangOpen)}
                className="min-w-[330px] flex items-center justify-between px-3 py-3 text-left text-[#212529] hover:text-[#034F98] font-normal"
              >
                {LANG_LABELS[currentLocale]}
                <ChevronDown size={16} className={`transition-transform ${mobileLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileLangOpen && (
                <div className="pl-5 py-3 flex flex-col gap-1">
                  {otherLocales.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      disabled={isPending}
                      className="block w-full text-left px-3 py-3 text-sm text-[#4d4d4d] hover:text-[#034F98]"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
