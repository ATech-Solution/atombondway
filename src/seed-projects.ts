/**
 * Seeds project metadata + downloads/uploads gallery images from atombondway.com
 * Run: npx tsx src/seed-projects.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { readFileSync } from 'fs'
import os from 'os'
import path from 'path'

const BASE = 'https://atombondway.com/wp-content/uploads'

const PROJECTS = [
  {
    slug: 'ifc-2',
    en: {
      title: 'IFC 2',
      category: 'Commercial',
      architect: 'César Pelli & Associates',
      developer: 'Sun Hung Kai Properties',
      materialSupplied: 'DC 791, 795, 983, 991',
      buildingType: 'Office Tower, Shopping Mall',
      summary: 'IFC 2 is a major mixed-use development in Hong Kong featuring an office tower and shopping mall, using premium DOWSIL™ silicone sealants throughout.',
    },
    zh: {
      title: 'IFC 2',
      category: '商業',
      architect: 'César Pelli & Associates',
      developer: '新鴻基地產',
      materialSupplied: 'DC 791, 795, 983, 991',
      buildingType: '辦公大樓、購物商場',
      summary: 'IFC 2是香港主要的綜合發展項目，設有辦公大樓及購物商場，全面採用陶氏矽酮密封膠。',
    },
    images: [`${BASE}/p10.jpg`, `${BASE}/p11.jpg`],
  },
  {
    slug: 'international-commerce-centre',
    en: {
      title: 'International Commerce Centre',
      category: 'Commercial',
      architect: 'Belt Collins & Associates, Kohn Pedersen Fox Associates',
      developer: 'Sun Hung Kai Properties',
      materialSupplied: 'Thermalbond',
      buildingType: 'Office Tower, Shopping Mall',
      summary: 'The International Commerce Centre is a landmark skyscraper in West Kowloon featuring advanced curtain wall systems with structural silicone glazing.',
    },
    zh: {
      title: '環球貿易廣場',
      category: '商業',
      architect: 'Belt Collins & Associates, Kohn Pedersen Fox Associates',
      developer: '新鴻基地產',
      materialSupplied: 'Thermalbond',
      buildingType: '辦公大樓、購物商場',
      summary: '環球貿易廣場是西九龍的地標摩天大廈，採用先進幕牆系統及結構矽酮玻璃工程。',
    },
    images: [`${BASE}/p20.jpg`, `${BASE}/p21.jpg`, `${BASE}/p22.jpg`],
  },
  {
    slug: 'tamar-development-project',
    en: {
      title: 'Tamar Development Project',
      category: 'Government',
      materialSupplied: 'Thermalbond',
      buildingType: 'Government Building',
      summary: 'The Tamar Development Project is the Hong Kong Government Headquarters complex featuring high-performance curtain wall systems.',
    },
    zh: {
      title: '添馬發展項目',
      category: '政府',
      materialSupplied: 'Thermalbond',
      buildingType: '政府建築',
      summary: '添馬發展項目為香港政府總部建築群，採用高性能幕牆系統。',
    },
    images: [`${BASE}/p300.jpg`, `${BASE}/p31.jpg`, `${BASE}/p32.jpg`, `${BASE}/p33.jpg`, `${BASE}/p34.jpg`],
  },
  {
    slug: 'hysan-place',
    en: {
      title: 'Hysan Place',
      category: 'Commercial',
      developer: 'Hysan Development Co. Ltd.',
      materialSupplied: 'Thermalbond',
      buildingType: 'Shopping Mall, Office Center',
      summary: 'Hysan Place is a landmark mixed-use development in Causeway Bay with a contract value of HK$1.5 billion, featuring high-performance spacer tapes throughout.',
    },
    zh: {
      title: '希慎廣場',
      category: '商業',
      developer: '希慎興業有限公司',
      materialSupplied: 'Thermalbond',
      buildingType: '購物商場、辦公中心',
      summary: '希慎廣場是銅鑼灣地標性綜合發展項目，合約金額達15億港元，全面採用高性能間隔膠帶。',
    },
    images: [`${BASE}/p40.jpg`, `${BASE}/p41.jpg`, `${BASE}/p42.jpg`, `${BASE}/p43.jpg`, `${BASE}/p44.jpg`],
  },
  {
    slug: 'kai-tak-cruise-terminal',
    en: {
      title: 'Kai Tak Cruise Terminal',
      category: 'Infrastructure',
      architect: 'Foster + Partners',
      materialSupplied: 'Thermalbond Building',
      buildingType: 'Public Transportation Hub',
      summary: 'The Kai Tak Cruise Terminal, designed by Foster + Partners, is a world-class public transportation hub featuring advanced glazing and structural sealant systems.',
    },
    zh: {
      title: '啟德郵輪碼頭',
      category: '基礎設施',
      architect: 'Foster + Partners',
      materialSupplied: 'Thermalbond Building',
      buildingType: '公共交通樞紐',
      summary: '啟德郵輪碼頭由Foster + Partners設計，是世界級公共交通樞紐，採用先進玻璃幕牆及結構密封膠系統。',
    },
    images: [`${BASE}/p50.jpg`, `${BASE}/p51.jpg`],
  },
  {
    slug: 'altira-macau',
    en: {
      title: 'Altira Macau',
      category: 'Hospitality',
      architect: 'Wong Tung & Partners',
      materialSupplied: 'Thermalbond Building',
      buildingType: 'Recreation & Tourism',
      summary: 'Altira Macau is a luxury hotel and resort development in Macau featuring premium curtain wall systems with high-performance building materials.',
    },
    zh: {
      title: '澳門新濠天地',
      category: '酒店',
      architect: 'Wong Tung & Partners',
      materialSupplied: 'Thermalbond Building',
      buildingType: '消閒及旅遊',
      summary: '澳門新濠天地是澳門豪華酒店及度假村發展項目，採用高性能建築材料的優質幕牆系統。',
    },
    images: [`${BASE}/p60-768x1024.jpg`, `${BASE}/p61.jpg`, `${BASE}/p62.jpg`],
  },
]

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) { console.warn(`  ⚠ ${res.status} ${url}`); return false }
    writeFileSync(destPath, Buffer.from(await res.arrayBuffer()))
    return true
  } catch (e: any) { console.warn(`  ⚠ ${e.message}`); return false }
}

async function run() {
  const payload = await getPayload({ config })
  const tmpDir = path.join(os.tmpdir(), 'compro-projects')
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

  console.log('🏗  Seeding project metadata + images...\n')

  for (const proj of PROJECTS) {
    const res = await payload.find({ collection: 'projects', where: { slug: { equals: proj.slug } }, limit: 1 })
    let id: string | number
    if (!res.docs.length) {
      // Create it if missing
      const created = await payload.create({
        collection: 'projects',
        locale: 'en',
        data: { title: proj.en.title, slug: proj.slug, featured: true, order: 0 } as any,
      })
      id = created.id
      await payload.update({ collection: 'projects', id, locale: 'zh', data: { title: proj.zh.title } as any })
    } else {
      id = res.docs[0].id
    }

    // Download and upload gallery images
    const galleryIds: any[] = []
    for (const imgUrl of proj.images) {
      const filename = path.basename(imgUrl)
      const tmpPath = path.join(tmpDir, `${proj.slug}-${filename}`)
      const ok = await downloadImage(imgUrl, tmpPath)
      if (!ok) continue
      try {
        const buf = readFileSync(tmpPath)
        const mediaDoc = await payload.create({
          collection: 'media',
          data: { alt: proj.en.title } as any,
          file: { data: buf, mimetype: 'image/jpeg', name: filename, size: buf.length },
        })
        galleryIds.push({ image: mediaDoc.id })
        unlinkSync(tmpPath)
      } catch (e: any) { console.warn(`  ⚠ Upload failed: ${e.message}`) }
    }

    // Update EN
    await payload.update({
      collection: 'projects', id, locale: 'en',
      data: {
        category: proj.en.category,
        summary: proj.en.summary,
        architect: (proj.en as any).architect,
        developer: (proj.en as any).developer,
        materialSupplied: (proj.en as any).materialSupplied,
        buildingType: (proj.en as any).buildingType,
        ...(galleryIds.length && { coverImage: galleryIds[0].image, gallery: galleryIds.slice(1) }),
      } as any,
    })

    // Update ZH
    await payload.update({
      collection: 'projects', id, locale: 'zh',
      data: {
        category: proj.zh.category,
        summary: proj.zh.summary,
        architect: (proj.zh as any).architect || (proj.en as any).architect,
        developer: (proj.zh as any).developer,
        buildingType: (proj.zh as any).buildingType,
      } as any,
    })

    console.log(`  ✓ ${proj.en.title} (${galleryIds.length} images)`)
  }

  console.log('\n✅ Project seeding complete!')
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
