/**
 * Seed script — populates the CMS with demo content based on atombondway.com
 * Run: npx tsx src/seed.ts
 *
 * Safe to run multiple times (uses updateGlobal / upsert patterns).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })
  console.log('🌱 Seeding database...\n')

  // ─── Admin User ───────────────────────────────────────────────────
  const adminEmail = 'tan@atech.software'
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
  })

  if (existing.docs.length) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        name: 'Tan',
        role: 'admin',
        password: 'Admin1234!',
      } as any,
    })
    console.log('✓ Admin user updated (tan@atech.software)')
  } else {
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: 'Admin1234!',
        name: 'Tan',
        role: 'admin',
        _verified: true,
      } as any,
    })
    console.log('✓ Admin user created (tan@atech.software / Admin1234!)')
  }

  // ─── Site Settings ───────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      companyName: 'Atom Bondway',
      domain: 'https://atombondway.com',
      defaultMeta: {
        title: 'Atom Bondway — Official Building Materials Distributor in Hong Kong',
        description:
          'Atom Bondway is the official distributor of high-performance building materials for curtain wall façade projects in Hong Kong.',
        keywords: 'silicone sealants, curtain wall, facade, building materials, Hong Kong',
      },
      footer: {
        copyrightText: `© ${new Date().getFullYear()} Atom Bondway Company Limited. All Rights Reserved.`,
        tagline:
          'Official distributor of high-performance building materials for curtain wall façade projects in Hong Kong.',
      },
    } as any,
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'zh',
    data: {
      companyName: '力新邦威',
      defaultMeta: {
        title: '力新邦威有限公司 — 香港官方幕牆建築工程材料經銷商',
        description:
          '力新邦威有限公司是優質幕牆建築工程材料的官方香港經銷商，於2001年成立。',
        keywords: '矽酮密封膠, 幕牆, 建築材料, 香港',
      },
      footer: {
        copyrightText: `© ${new Date().getFullYear()} 力新邦威有限公司。版權所有。`,
        tagline: '優質幕牆建築工程材料的官方香港經銷商。',
      },
    } as any,
  })
  console.log('✓ Site Settings')

  // ─── Footer Settings ──────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'footer-settings',
    locale: 'en',
    data: {
      contactText:
        'Official distributor of high-performance building materials for curtain wall façade projects in Hong Kong.',
      showContactInfo: true,
      copyrightText: `© ${new Date().getFullYear()} Atom Bondway Company Limited. All Rights Reserved.`,
      showBackToTop: true,
    } as any,
  })
  await payload.updateGlobal({
    slug: 'footer-settings',
    locale: 'zh',
    data: {
      contactText: '優質幕牆建築工程材料的官方香港經銷商，誠信服務業界超過二十年。',
      showContactInfo: true,
      copyrightText: `© ${new Date().getFullYear()} 力新邦威有限公司。版權所有。`,
      showBackToTop: true,
    } as any,
  })
  console.log('✓ Footer Settings')

  // ─── Navigation ───────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: {
      items: [
        { label: 'Home',     href: '/',         openInNewTab: false },
        { label: 'Products', href: '/products', openInNewTab: false },
        { label: 'Projects', href: '/projects', openInNewTab: false },
        { label: 'Services', href: '/services', openInNewTab: false },
        { label: 'About Us', href: '/about',    openInNewTab: false },
        { label: 'Contact',  href: '/contact',  openInNewTab: false },
      ],
    } as any,
  })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'zh',
    data: {
      items: [
        { label: '首頁',     href: '/',         openInNewTab: false },
        { label: '產品',     href: '/products', openInNewTab: false },
        { label: '項目',     href: '/projects', openInNewTab: false },
        { label: '服務',     href: '/services', openInNewTab: false },
        { label: '關於我們', href: '/about',    openInNewTab: false },
        { label: '聯繫我們', href: '/contact',  openInNewTab: false },
      ],
    } as any,
  })
  console.log('✓ Navigation')

  // ─── Hero (via home-page global) ──────────────────────────────────
  await payload.updateGlobal({
    slug: 'home-page',
    locale: 'en',
    data: {
      heroSectionTitle: 'WE SEAL THE SUCCESS OF HONG KONG',
      heroSectionCtaText: 'TELL ME MORE',
      heroSectionCtaHref: '/about',
      heroSectionoverlayOpacity: 55,
      seoTitle: 'Atom Bondway — We Seal the Success of Hong Kong',
      seoDescription:
        "Official distributor of DOWSIL™ silicone sealants, Saint Gobain spacer tapes, and Wood's Powr-Grip suction grips for curtain wall projects in Hong Kong.",
    } as any,
  })
  await payload.updateGlobal({
    slug: 'home-page',
    locale: 'zh',
    data: {
      heroSectionTitle: '鋪創香港成功之路',
      heroSectionCtaText: '了解更多',
      heroSectionCtaHref: '/about',
      heroSectionoverlayOpacity: 55,
    } as any,
  })
  console.log('✓ Hero Content')

  // ─── About Page ───────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'about-page',
    locale: 'en',
    data: {
      pageTitle: 'Your Trusted Building Materials Partner',
    } as any,
  })
  await payload.updateGlobal({
    slug: 'about-page',
    locale: 'zh',
    data: {
      pageTitle: '您值得信賴的建築材料夥伴',
    } as any,
  })
  console.log('✓ About Page')

  // ─── Services Page ────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'services-page',
    locale: 'en',
    data: {
      pageTitle: 'Our Services',
      pageSubtitle:
        'We provide comprehensive technical services to support every stage of your curtain wall and façade project.',
      meta: {
        title: 'Services | Atom Bondway',
        description:
          'Drawing review, sample testing, gasket cutting, and quality certification services for curtain wall façade projects in Hong Kong.',
      },
    } as any,
  })
  await payload.updateGlobal({
    slug: 'services-page',
    locale: 'zh',
    data: {
      pageTitle: '我們的服務',
      pageSubtitle: '我們提供全面的技術服務，支援幕牆及建築立面項目的每個階段。',
      meta: {
        title: '服務 | 力新邦威',
        description: '為香港幕牆建築立面項目提供審圖、樣本測試、割膠及質量認證服務。',
      },
    } as any,
  })
  console.log('✓ Services Page')

  // ─── Products Page ────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'products-page',
    locale: 'en',
    data: {
      pageTitle: 'Our Products',
      pageSubtitle:
        'We distribute world-class building materials from leading global brands for curtain wall and façade applications.',
      meta: {
        title: 'Products | Atom Bondway',
        description:
          'DOWSIL™ silicone sealants, Saint Gobain spacer tapes, and Wood\'s Powr-Grip suction grips — official distributor in Hong Kong.',
      },
    } as any,
  })
  await payload.updateGlobal({
    slug: 'products-page',
    locale: 'zh',
    data: {
      pageTitle: '我們的產品',
      pageSubtitle: '我們代理來自全球頂尖品牌的優質建築材料，專注幕牆及建築立面應用。',
      meta: {
        title: '產品 | 力新邦威',
        description: '陶氏矽酮密封膠、聖戈班間隔膠帶及吸盤工具 — 香港官方代理商。',
      },
    } as any,
  })
  console.log('✓ Products Page')

  // ─── Projects Page ────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'projects-page',
    locale: 'en',
    data: {
      pageTitle: 'Our Projects',
      pageSubtitle:
        'Explore our portfolio of landmark curtain wall and façade projects across Hong Kong and the region.',
      meta: {
        title: 'Projects | Atom Bondway',
        description:
          'Landmark curtain wall and façade projects completed by Atom Bondway across Hong Kong, Macau, and the region.',
      },
    } as any,
  })
  await payload.updateGlobal({
    slug: 'projects-page',
    locale: 'zh',
    data: {
      pageTitle: '我們的項目',
      pageSubtitle: '探索我們在香港及大灣區完成的標誌性幕牆及建築立面項目組合。',
      meta: {
        title: '項目 | 力新邦威',
        description: '力新邦威在香港、澳門及大灣區完成的標誌性幕牆及建築立面項目。',
      },
    } as any,
  })
  console.log('✓ Projects Page')

  // ─── Contact Info (via footer-settings global) ────────────────────
  await payload.updateGlobal({
    slug: 'footer-settings',
    locale: 'en',
    data: {
      address:      'Room A, 21/F, Yam Tze Commercial Building,\n23 Thomson Road, Wan Chai, Hong Kong',
      phone:        '+(852) 2563 9800',
      fax:          '+(852) 2563 3298',
      email:        'info@atombondway.com.hk',
      businessHours:'Mon – Fri: 9:00am – 6:00pm',
      contactFormEnabled: true,
      showContactInfo: true,
      copyrightText: `© ${new Date().getFullYear()} Atom Bondway Company Limited. All Rights Reserved.`,
      showBackToTop: true,
    } as any,
  })
  await payload.updateGlobal({
    slug: 'footer-settings',
    locale: 'zh',
    data: {
      address:      '香港灣仔莊士敦道23號\n任資商業大廈21樓A室',
      businessHours:'星期一至五：上午9時至下午6時',
      copyrightText: `© ${new Date().getFullYear()} 力新邦威有限公司。版權所有。`,
    } as any,
  })
  console.log('✓ Contact Info')

  // ─── Services collection removed — services are now managed via the ServicesPage global ───

  // ─── Products ─────────────────────────────────────────────────────
  const productsData = [
    // ── DOWSIL™ Sealants ──────────────────────────────────────────
    {
      en: {
        name: 'DOWSIL™ 791 Silicone Weatherproofing Sealant',
        tagline: 'Neutral one-part sealant for general glazing and weather sealing in curtain wall and building facades.',
      },
      zh: {
        name: '陶氏™ 791 矽酮防水密封膠',
        tagline: '中性單組份密封膠，適用於幕牆及建築立面的一般玻璃安裝及防水密封。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 1, featured: true,
    },
    {
      en: {
        name: 'DOWSIL™ 795 Structural Glazing Sealant',
        tagline: 'One-component neutral-cure silicone for structural and weatherseal glazing with ±50% movement capability.',
      },
      zh: {
        name: '陶氏™ 795 結構玻璃密封膠',
        tagline: '單組份中性固化矽酮，適用於結構及防水密封玻璃工程，移動能力±50%。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 2, featured: true,
    },
    {
      en: {
        name: 'DOWSIL™ 983 Structural Glazing Sealant',
        tagline: 'Low-VOC two-part sealant for factory glazing and curtain wall production with ±25% movement capability.',
      },
      zh: {
        name: '陶氏™ 983 結構玻璃密封膠',
        tagline: '低VOC雙組份密封膠，適用於工廠玻璃安裝及幕牆生產，移動能力±25%。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 3, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 798 Cold and Cleanroom Silicone Sealant',
        tagline: 'Mildew-resistant sealant designed for refrigeration units, cold rooms, and cleanroom environments.',
      },
      zh: {
        name: '陶氏™ 798 冷室及潔淨室矽酮密封膠',
        tagline: '防霉密封膠，專為冷藏設備、冷室及潔淨室環境而設計。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 4, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 991 Silicone High Performance Sealant',
        tagline: 'Non-staining sealant with ±50% movement for natural stone, metal panels, and porous substrates.',
      },
      zh: {
        name: '陶氏™ 991 高性能矽酮密封膠',
        tagline: '防污染密封膠，移動能力±50%，適用於天然石材、金屬面板及多孔底材。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 5, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 995 Silicone Structural Sealant',
        tagline: 'Self-priming structural sealant for hurricane-rated windows, doors, and structural glazing systems.',
      },
      zh: {
        name: '陶氏™ 995 矽酮結構密封膠',
        tagline: '自底漆結構密封膠，適用於颶風級窗門及結構玻璃幕牆系統。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 6, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 790 Silicone Building Sealant',
        tagline: 'Outstanding +100%/−50% movement sealant for expansion joints, precast concrete, EIFS, and masonry.',
      },
      zh: {
        name: '陶氏™ 790 矽酮建築密封膠',
        tagline: '卓越移動能力+100%/-50%，適用於伸縮縫、預製混凝土、EIFS及砌體工程。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 7, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 688 Glazing and Cladding Sealant',
        tagline: 'One-part neutral cure sealant for glazing, weather sealing, and caulking. Meets CNS 8903, BS 5889.',
      },
      zh: {
        name: '陶氏™ 688 玻璃幕牆及外牆密封膠',
        tagline: '單組份中性固化密封膠，適用於玻璃安裝、防水密封及填縫。符合CNS 8903、BS 5889標準。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 8, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 121 Structural Glazing Sealant',
        tagline: 'Two-part 1:1 neutral-cure sealant for structural glazing repair and replacement with 20-year warranty.',
      },
      zh: {
        name: '陶氏™ 121 結構玻璃密封膠',
        tagline: '雙組份1:1中性固化密封膠，適用於結構玻璃維修及更換，提供20年保固。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, order: 9, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ 1200 OS Primer',
        tagline: 'One-part ozone-safe primer that improves adhesion of silicone sealants to difficult substrates.',
      },
      zh: {
        name: '陶氏™ 1200 OS 底漆',
        tagline: '單組份無臭氧底漆，提升矽酮密封膠對難黏底材的附著力。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Primers', zh: '陶氏底漆' }, order: 10, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ Primer-C',
        tagline: 'Single-component primer for painted and plastic surfaces; UV-fluorescent for visual application confirmation.',
      },
      zh: {
        name: '陶氏™ C型底漆',
        tagline: '單組份底漆，適用於塗漆及塑料表面；紫外線熒光設計便於確認塗覆情況。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Primers', zh: '陶氏底漆' }, order: 11, featured: false,
    },
    {
      en: {
        name: 'DOWSIL™ Primer P',
        tagline: 'Film-forming primer for porous substrates including masonry, stone, and concrete surfaces.',
      },
      zh: {
        name: '陶氏™ P型底漆',
        tagline: '成膜底漆，適用於砌體、石材及混凝土等多孔底材。',
      },
      category: { en: 'DOWSIL™ Sealants', zh: '陶氏密封膠' }, categorySlug: 'silicone-sealants',
      subcategory: { en: 'DOWSIL™ Primers', zh: '陶氏底漆' }, order: 12, featured: false,
    },

    // ── Saint-Gobain Spacer Tapes ──────────────────────────────────
    {
      en: {
        name: 'Norbond® V4600',
        tagline: 'Gray polyurethane foam double-sided tape with high-performance acrylic adhesive for severe exterior bonding.',
      },
      zh: {
        name: 'Norbond® V4600',
        tagline: '灰色聚氨酯泡棉雙面膠帶，配備高性能丙烯酸粘合劑，適用於嚴苛外牆粘合。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norbond®', zh: 'Norbond®' }, order: 13, featured: true,
    },
    {
      en: {
        name: 'Thermalbond® V2200',
        tagline: 'Open-cell PU foam structural glazing spacer tape with low thermal conductivity for LEED-eligible projects.',
      },
      zh: {
        name: 'Thermalbond® V2200',
        tagline: '開孔聚氨酯泡棉結構玻璃間隔膠帶，低導熱性，符合LEED標準。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Thermalbond®', zh: 'Thermalbond®' }, order: 14, featured: false,
    },
    {
      en: {
        name: 'Thermalbond® V2100',
        tagline: 'Semi-rigid open-cell PU foam spacer tape for two-sided and four-sided structural glazing systems.',
      },
      zh: {
        name: 'Thermalbond® V2100',
        tagline: '半剛性開孔聚氨酯泡棉間隔膠帶，適用於兩面及四面結構玻璃幕牆系統。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Thermalbond®', zh: 'Thermalbond®' }, order: 15, featured: false,
    },
    {
      en: {
        name: 'Norbond® 1300/1400',
        tagline: 'White PU foam double-sided acrylic tape for signs, mirrors, panels, and glass lamination applications.',
      },
      zh: {
        name: 'Norbond® 1300/1400',
        tagline: '白色聚氨酯泡棉雙面丙烯酸膠帶，適用於招牌、鏡子、面板及玻璃夾層應用。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norbond®', zh: 'Norbond®' }, order: 16, featured: false,
    },
    {
      en: {
        name: 'Norseal® V980/V990',
        tagline: 'Closed-cell PVC foam glazing tape for residential and commercial windows, refrigeration, and HVAC systems.',
      },
      zh: {
        name: 'Norseal® V980/V990',
        tagline: '閉孔PVC泡棉玻璃膠帶，適用於住宅及商業窗戶、冷藏設備及暖通空調系統。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norseal®', zh: 'Norseal®' }, order: 17, featured: false,
    },
    {
      en: {
        name: 'Norseal® V780',
        tagline: 'Medium-density closed-cell PVC foam tape for truck body sealing, corrugated panels, and outdoor lighting.',
      },
      zh: {
        name: 'Norseal® V780',
        tagline: '中密度閉孔PVC泡棉膠帶，適用於車廂密封、波紋板及戶外照明。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norseal®', zh: 'Norseal®' }, order: 18, featured: false,
    },
    {
      en: {
        name: 'Norseal® V770',
        tagline: 'Low-density closed-cell foam tape for curtain walls, electronic cabinets, HVAC, and refrigeration sealing.',
      },
      zh: {
        name: 'Norseal® V770',
        tagline: '低密度閉孔泡棉膠帶，適用於幕牆、電子機箱、暖通空調及冷藏密封。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norseal®', zh: 'Norseal®' }, order: 19, featured: false,
    },
    {
      en: {
        name: 'Norseal® V760',
        tagline: 'High-density closed-cell PVC foam tape for die-cut gaskets, metal-to-metal sealing, and bus/truck applications.',
      },
      zh: {
        name: 'Norseal® V760',
        tagline: '高密度閉孔PVC泡棉膠帶，適用於模切墊片、金屬對金屬密封及巴士/貨車應用。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norseal®', zh: 'Norseal®' }, order: 20, featured: false,
    },
    {
      en: {
        name: 'Norseal® V710',
        tagline: 'Medium-density paper-lined foam tape for duct seals, vehicle roofline, and corrugated panel lap joints.',
      },
      zh: {
        name: 'Norseal® V710',
        tagline: '中密度紙底泡棉膠帶，適用於風管密封、車頂線及波紋板搭接縫。',
      },
      category: { en: 'Saint-Gobain Spacer Tapes', zh: '聖戈班間隔膠帶' }, categorySlug: 'spacer-tapes',
      subcategory: { en: 'Norseal®', zh: 'Norseal®' }, order: 21, featured: false,
    },

    // ── Backer Rod ────────────────────────────────────────────────
    {
      en: {
        name: 'Atomcell Backer Rod',
        tagline: 'Closed-cell polyethylene foam backer rod in sizes 6–50mm for controlling sealant depth and joint bonding.',
      },
      zh: {
        name: 'Atomcell 背襯帶',
        tagline: '閉孔聚乙烯泡棉背襯帶，尺寸6至50毫米，用於控制密封膠深度及接縫粘合。',
      },
      category: { en: 'Backer Rod', zh: '背襯帶' }, categorySlug: 'backer-rod',
      subcategory: null, order: 22, featured: true,
    },

    // ── Wood's Powr-Grip ──────────────────────────────────────────
    {
      en: {
        name: "WPG N6450 10\" Hand Cup",
        tagline: 'Metal-handle vacuum suction cup for curved and flat nonporous surfaces. 175 lb (79 kg) lifting capacity.',
      },
      zh: {
        name: 'WPG N6450 10吋手持吸盤',
        tagline: '金屬手柄真空吸盤，適用於彎曲及平坦非多孔表面，承重175磅（79公斤）。',
      },
      category: { en: "Wood's Powr-Grip", zh: '吸盤工具' }, categorySlug: 'suction-grip',
      subcategory: null, order: 23, featured: true,
    },
    {
      en: {
        name: 'WPG MRT4 Lifter Series',
        tagline: 'Medium-duty rotator/tilter with Intelli-Grip® Technology for safe glass lifting on construction sites.',
      },
      zh: {
        name: 'WPG MRT4 吊運系列',
        tagline: '中型旋轉/傾斜吊具，配備Intelli-Grip®智能技術，安全吊運工地玻璃面板。',
      },
      category: { en: "Wood's Powr-Grip", zh: '吸盤工具' }, categorySlug: 'suction-grip',
      subcategory: null, order: 24, featured: false,
    },
  ]

  for (const prod of productsData) {
    const slug = prod.en.name.toLowerCase().replace(/[™®'"]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const existingProd = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1 })
    let id: string | number
    if (existingProd.docs.length) {
      id = existingProd.docs[0].id
      await payload.update({ collection: 'products', id, locale: 'en', data: { name: prod.en.name, tagline: prod.en.tagline, category: prod.category.en, categorySlug: prod.categorySlug, subcategory: prod.subcategory?.en ?? null, featured: prod.featured, order: prod.order, slug } as any })
    } else {
      const doc = await payload.create({ collection: 'products', locale: 'en', data: { name: prod.en.name, tagline: prod.en.tagline, category: prod.category.en, categorySlug: prod.categorySlug, subcategory: prod.subcategory?.en ?? null, featured: prod.featured, order: prod.order, slug } as any })
      id = doc.id
    }
    await payload.update({ collection: 'products', id, locale: 'zh', data: { name: prod.zh.name, tagline: prod.zh.tagline, category: prod.category.zh, subcategory: prod.subcategory?.zh ?? null } as any })
  }
  console.log('✓ Products (24)')

  // ─── Projects ─────────────────────────────────────────────────────
  const projectsData = [
    {
      en: { title: 'Altira Macau',                  summary: 'High-rise luxury hotel curtain wall installation using DOWSIL™ structural silicone sealants for façade weatherproofing.', category: 'Hospitality' },
      zh: { title: '澳門新濠天地',                    summary: '採用陶氏矽酮密封膠進行高層豪華酒店幕牆安裝及立面防水工程。', category: '酒店' },
      order: 1, featured: true,
    },
    {
      en: { title: 'Kai Tak Cruise Terminal',        summary: "Large-scale glazing and structural sealant application for Hong Kong's premier cruise terminal facility.", category: 'Infrastructure' },
      zh: { title: '啟德郵輪碼頭',                    summary: '香港主要郵輪碼頭設施的大型玻璃幕牆及結構密封膠工程。', category: '基礎設施' },
      order: 2, featured: true,
    },
    {
      en: { title: 'Hysan Place',                   summary: 'Premium curtain wall and weatherproofing solutions for this landmark Causeway Bay mixed-use development.', category: 'Commercial' },
      zh: { title: '希慎廣場',                        summary: '銅鑼灣地標性綜合發展項目的優質幕牆及防水解決方案。', category: '商業' },
      order: 3, featured: true,
    },
    {
      en: { title: 'Tamar Development Project',     summary: 'Government headquarters complex featuring advanced curtain wall systems with structural silicone glazing.', category: 'Government' },
      zh: { title: '添馬發展項目',                    summary: '政府總部建築群採用先進幕牆系統及結構矽酮玻璃工程。', category: '政府' },
      order: 4, featured: true,
    },
    {
      en: { title: 'International Commerce Centre', summary: "Hong Kong's tallest skyscraper — ICC tower glazing project featuring high-performance DOWSIL™ sealants.", category: 'Commercial' },
      zh: { title: '環球貿易廣場',                    summary: '香港最高摩天大廈幕牆玻璃工程，採用高性能陶氏密封膠。', category: '商業' },
      order: 5, featured: true,
    },
  ]

  for (const proj of projectsData) {
    const slug = proj.en.title.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const existingProj = await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1 })
    let id: string | number
    if (existingProj.docs.length) {
      id = existingProj.docs[0].id
      await payload.update({ collection: 'projects', id, locale: 'en', data: { title: proj.en.title, summary: proj.en.summary, category: proj.en.category, featured: proj.featured, order: proj.order, slug } as any })
    } else {
      const doc = await payload.create({ collection: 'projects', locale: 'en', data: { title: proj.en.title, summary: proj.en.summary, category: proj.en.category, featured: proj.featured, order: proj.order, slug } as any })
      id = doc.id
    }
    await payload.update({ collection: 'projects', id, locale: 'zh', data: { title: proj.zh.title, summary: proj.zh.summary, category: proj.zh.category } as any })
  }
  console.log('✓ Projects (5)')

  console.log('\n✅ Seeding complete!\n')
  console.log('Admin login:')
  console.log('  Email:    tan@atech.software')
  console.log('  Password: Admin1234!')
  console.log('\nNext steps:')
  console.log('  1. Open http://localhost:3000/admin')
  console.log('  2. Upload a hero background image in Globals → Hero Section')
  console.log('  3. Upload product/project images in Collections → Media')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
