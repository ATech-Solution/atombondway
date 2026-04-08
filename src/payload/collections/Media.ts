import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { isAuthenticated, isPublic } from '../access'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function getRequestSiteUrl(reqSiteUrl?: string): string {
  return (reqSiteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function normalizeMediaUrl(url: string | null | undefined, siteUrl: string): string | null {
  if (!url) return null

  const escapedSiteUrl = siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let normalized = url
    .replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '')
    .replace(new RegExp(`^https?:\/\/${escapedSiteUrl}`), '')

  // Convert API URLs to static URLs
  if (normalized.startsWith('/api/media/file/')) {
    normalized = normalized.replace('/api/media/file/', '/media/')
  }

  if (normalized.startsWith('/')) {
    return normalized
  }

  return url
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    description: 'All uploaded images and files are stored here.',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterRead: [
      ({ doc, req }) => {
        if (!doc || typeof doc !== 'object') return doc

        const siteUrl = getRequestSiteUrl(req?.payload?.config?.serverURL)

        if (typeof doc.url === 'string') {
          // First normalize absolute URLs
          doc.url = normalizeMediaUrl(doc.url, siteUrl)
          // Then convert API URLs to static URLs
          if (doc.url.startsWith('/api/media/file/')) {
            doc.url = doc.url.replace('/api/media/file/', '/media/')
          }
        }

        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const size of Object.values(doc.sizes)) {
            if (size && typeof size === 'object' && typeof (size as any).url === 'string') {
              ;(size as any).url = normalizeMediaUrl((size as any).url, siteUrl)
              if ((size as any).url.startsWith('/api/media/file/')) {
                ;(size as any).url = (size as any).url.replace('/api/media/file/', '/media/')
              }
            }
          }
        }

        return doc
      },
    ],
  },
  upload: {
    // Store files in public/media — served as static files by Next.js
    staticDir: path.resolve(dirname, '../../../public/media'),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 480,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      localized: true,
      admin: {
        description: 'Describe the image for accessibility and SEO. Not required for PDFs.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      localized: true,
    },
  ],
}
