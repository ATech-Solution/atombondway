/**
 * Downloads product images from atombondway.com, uploads to Payload media,
 * and links each image to its product.
 * Run: npx tsx src/seed-images.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import os from 'os'

const PRODUCTS: { slug: string; imageUrl: string; altEn: string }[] = [
  { slug: 'dowsil-791-silicone-weatherproofing-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-791-1-1172x850.jpeg', altEn: 'DOWSIL™ 791 Silicone Weatherproofing Sealant' },
  { slug: 'dowsil-795-structural-glazing-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-795-2-750x1024.jpeg', altEn: 'DOWSIL™ 795 Structural Glazing Sealant' },
  { slug: 'dowsil-983-structural-glazing-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-983-2-750x1024.jpeg', altEn: 'DOWSIL™ 983 Structural Glazing Sealant' },
  { slug: 'dowsil-798-cold-and-cleanroom-silicone-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-798-1-1172x850.jpeg', altEn: 'DOWSIL™ 798 Cold and Cleanroom Silicone Sealant' },
  { slug: 'dowsil-991-silicone-high-performance-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-991-1-750x1024.jpeg', altEn: 'DOWSIL™ 991 Silicone High Performance Sealant' },
  { slug: 'dowsil-995-silicone-structural-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-995-2-750x1024.jpeg', altEn: 'DOWSIL™ 995 Silicone Structural Sealant' },
  { slug: 'dowsil-790-silicone-building-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-790-1-1172x850.jpeg', altEn: 'DOWSIL™ 790 Silicone Building Sealant' },
  { slug: 'dowsil-688-glazing-and-cladding-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-688-1-750x1024.jpeg', altEn: 'DOWSIL™ 688 Glazing and Cladding Sealant' },
  { slug: 'dowsil-121-structural-glazing-sealant', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-121-750x1024.jpeg', altEn: 'DOWSIL™ 121 Structural Glazing Sealant' },
  { slug: 'dowsil-1200-os-primer', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-1200OS-750x1024.jpeg', altEn: 'DOWSIL™ 1200 OS Primer' },
  { slug: 'dowsil-primer-c', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-Primer-C-2-750x1024.jpeg', altEn: 'DOWSIL™ Primer-C' },
  { slug: 'dowsil-primer-p', imageUrl: 'https://atombondway.com/wp-content/uploads/Dowsil-Primer-P-2-750x1024.jpeg', altEn: 'DOWSIL™ Primer P' },
  { slug: 'norbond-v4600', imageUrl: 'https://atombondway.com/wp-content/uploads/Norbond%C2%AE-V4600-1200x634.jpeg', altEn: 'Norbond® V4600' },
  { slug: 'thermalbond-v2200', imageUrl: 'https://atombondway.com/wp-content/uploads/2200-1-1200x850.jpeg', altEn: 'Thermalbond® V2200' },
  { slug: 'thermalbond-v2100', imageUrl: 'https://atombondway.com/wp-content/uploads/2100-1-1024x403.jpeg', altEn: 'Thermalbond® V2100' },
  { slug: 'norbond-13001400', imageUrl: 'https://atombondway.com/wp-content/uploads/Norbond%C2%AE-13001400-1024x804.jpeg', altEn: 'Norbond® 1300/1400' },
  { slug: 'norseal-v980v990', imageUrl: 'https://atombondway.com/wp-content/uploads/980990-1200x850.jpeg', altEn: 'Norseal® V980/V990' },
  { slug: 'norseal-v780', imageUrl: 'https://atombondway.com/wp-content/uploads/780-1200x850.jpeg', altEn: 'Norseal® V780' },
  { slug: 'norseal-v770', imageUrl: 'https://atombondway.com/wp-content/uploads/770.jpg', altEn: 'Norseal® V770' },
  { slug: 'norseal-v760', imageUrl: 'https://atombondway.com/wp-content/uploads/760-1200x850.jpeg', altEn: 'Norseal® V760' },
  { slug: 'norseal-v710', imageUrl: 'https://atombondway.com/wp-content/uploads/710-1-1200x850.jpeg', altEn: 'Norseal® V710' },
  { slug: 'atomcell-backer-rod', imageUrl: 'https://atombondway.com/wp-content/uploads/Atomcell-Backer-Rod-1-1024x1024.jpeg', altEn: 'Atomcell Backer Rod' },
  { slug: 'wpg-n6450-10-hand-cup', imageUrl: 'https://atombondway.com/wp-content/uploads/WPG-N6450.jpg', altEn: 'WPG N6450 10" Hand Cup' },
  { slug: 'wpg-mrt4-lifter-series', imageUrl: 'https://atombondway.com/wp-content/uploads/97786-1-1000x850.jpg', altEn: 'WPG MRT4 Lifter Series' },
]

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; curl/7.0)' },
    })
    if (!res.ok) {
      // Try alternate URL with encoded special chars
      console.warn(`  ⚠ HTTP ${res.status} for ${url}`)
      return false
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    writeFileSync(destPath, buffer)
    return true
  } catch (e: any) {
    console.warn(`  ⚠ Fetch error: ${e.message}`)
    return false
  }
}

async function seed() {
  const payload = await getPayload({ config })
  const tmpDir = join(os.tmpdir(), 'compro-images')
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

  console.log('🖼  Seeding product images...\n')

  for (const prod of PRODUCTS) {
    // Find product by slug (try exact match, then partial)
    let result = await payload.find({
      collection: 'products',
      where: { slug: { equals: prod.slug } },
      limit: 1,
    })

    // If not found by exact slug, try contains
    if (!result.docs.length) {
      result = await payload.find({
        collection: 'products',
        where: { slug: { contains: prod.slug.split('-').slice(0, 3).join('-') } },
        limit: 1,
      })
    }

    if (!result.docs.length) {
      console.log(`  ✗ Product not found: ${prod.slug}`)
      continue
    }

    const product = result.docs[0] as any

    // Skip if already has image
    if (product.image) {
      console.log(`  ✓ Already has image: ${product.name}`)
      continue
    }

    // Determine file extension
    const ext = prod.imageUrl.endsWith('.jpg') ? 'jpg' : 'jpeg'
    const filename = `${prod.slug}.${ext}`
    const tmpPath = join(tmpDir, filename)

    console.log(`  ↓ Downloading: ${prod.altEn}`)
    const ok = await downloadImage(prod.imageUrl, tmpPath)
    if (!ok) {
      console.log(`  ✗ Failed to download image for: ${prod.slug}`)
      continue
    }

    // Upload to Payload media collection
    try {
      const { createReadStream } = await import('fs')
      const { Readable } = await import('stream')
      const fs = await import('fs')
      const fileBuffer = fs.readFileSync(tmpPath)

      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: prod.altEn } as any,
        file: {
          data: fileBuffer,
          mimetype: ext === 'jpg' ? 'image/jpeg' : 'image/jpeg',
          name: filename,
          size: fileBuffer.length,
        },
      })

      // Link media to product
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { image: mediaDoc.id } as any,
      })

      console.log(`  ✓ Uploaded & linked: ${product.name}`)

      // Clean up temp file
      unlinkSync(tmpPath)
    } catch (e: any) {
      console.log(`  ✗ Upload failed for ${prod.slug}: ${e.message}`)
    }
  }

  console.log('\n✅ Image seeding complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Image seed failed:', err)
  process.exit(1)
})
