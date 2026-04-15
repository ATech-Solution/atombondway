import type { CollectionConfig } from 'payload'
import fs from 'fs'
import path from 'path'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate.ts'

const mediaUploadDir = process.env.PAYLOAD_MEDIA_DIR
  ? path.resolve(process.cwd(), process.env.PAYLOAD_MEDIA_DIR)
  : path.resolve(process.cwd(), 'public/media')

if (!fs.existsSync(mediaUploadDir)) {
  fs.mkdirSync(mediaUploadDir, { recursive: true })
}

function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Strip any absolute URL prefix
  let normalized = url.replace(/^https?:\/\/[^\/]+\//, '/')

  // Convert API URLs to static URLs
  if (normalized.startsWith('/api/media/file/')) {
    normalized = normalized.replace('/api/media/file/', '/media/')
  }

  return normalized
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
    afterChange: [
      revalidateOnChange,
      ({ doc }) => {
        // Ensure URLs are normalized after creation/update
        if (typeof doc.url === 'string') {
          doc.url = normalizeMediaUrl(doc.url)
        }

        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const size of Object.values(doc.sizes)) {
            if (size && typeof size === 'object' && typeof (size as any).url === 'string') {
              ;(size as any).url = normalizeMediaUrl((size as any).url)
            }
          }
        }

        return doc
      },
    ],
    afterDelete: [revalidateOnDelete],
    afterRead: [
      ({ doc }) => {
        if (!doc || typeof doc !== 'object') return doc

        if (typeof doc.url === 'string') {
          doc.url = normalizeMediaUrl(doc.url)
        }

        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const size of Object.values(doc.sizes)) {
            if (size && typeof size === 'object' && typeof (size as any).url === 'string') {
              ;(size as any).url = normalizeMediaUrl((size as any).url)
            }
          }
        }

        return doc
      },
    ],
  },
  upload: {
    // Store files in public/media — served as static files by Next.js
    // Use mediaUploadDir (process.cwd()-based) so the path is always relative
    // to the running process — never the dev machine's absolute path baked in at build time.
    staticDir: mediaUploadDir,
    // Disable local storage to ensure files are always written to disk
    disableLocalStorage: false,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'center',
      },
      {
        name: 'card',
        width: 768,
        height: 480,
        position: 'center',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'center',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'center',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon', 'application/pdf'],
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
      validate: (value: string | null | undefined) => {
        if (!value) return true // optional — PDFs don't need alt text
        if (value.trim().length < 3) return 'Alt text must be at least 3 characters to be meaningful.'
        if (value.length > 300) {
          return `Alt text is too long (${value.length} characters). Keep it under 300 characters — be concise.`
        }
        return true
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      localized: true,
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.length > 300) {
          return `Caption is too long (${value.length} characters). Keep it under 300 characters.`
        }
        return true
      },
    },
  ],
}
