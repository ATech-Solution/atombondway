import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import nodemailer from 'nodemailer'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/payload/collections/Users.ts'
import { Media } from './src/payload/collections/Media.ts'
import { Projects } from './src/payload/collections/Projects.ts'
import { ProjectCategory } from './src/payload/collections/ProjectCategory.ts'
import { Products } from './src/payload/collections/Products.ts'
import { ProductCategory } from './src/payload/collections/ProductCategory.ts'
import { Plugins } from './src/payload/collections/Plugins.ts'
import { PLUGIN_METADATA } from './src/plugins/backup-restore/index.ts'

import { Navigation } from './src/payload/globals/Navigation.ts'
import { SiteSettings } from './src/payload/globals/SiteSettings.ts'
import { FooterSettings } from './src/payload/globals/FooterSettings.ts'
import { CustomCSS } from './src/payload/globals/CustomCSS.ts'

import { HomePage } from './src/payload/globals/HomePage.ts'
import { ProductsPage } from './src/payload/globals/ProductsPage.ts'
import { ProjectsPage } from './src/payload/globals/ProjectsPage.ts'
import { ServicesPage } from './src/payload/globals/ServicesPage.ts'
import { AboutPage } from './src/payload/globals/AboutPage.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function envUrl(key: string): string {
  const suffix = process.env.NODE_ENV === 'production' ? '_PROD' : '_DEV'
  return process.env[`${key}${suffix}`] || process.env[key] || ''
}

const siteUrl = envUrl('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000'
const payloadServerUrl = envUrl('PAYLOAD_PUBLIC_SERVER_URL') || siteUrl
const localDevUrls = ['http://localhost:3000', 'http://127.0.0.1:3000']
const allowedOrigins = Array.from(new Set([payloadServerUrl, siteUrl, ...localDevUrls]))

// Resilient email adapter — send failures are logged but never thrown,
// so auth operations (forgot-password, user create+verify) never return "Something went wrong"
// due to an email transport error.
const buildEmailAdapter = async () => {
  const fromAddress = process.env.EMAIL_FROM || 'noreply@atombondway.com'
  const fromName = process.env.EMAIL_FROM_NAME || 'Atombondway'

  const transport = process.env.AWS_SES_SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.AWS_SES_SMTP_HOST || 'email-smtp.ap-southeast-1.amazonaws.com',
        port: parseInt(process.env.AWS_SES_SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.AWS_SES_SMTP_USER,
          pass: process.env.AWS_SES_SMTP_PASSWORD,
        },
      })
    : nodemailer.createTransport({ jsonTransport: true })

  return () => ({
    name: 'nodemailer',
    defaultFromAddress: fromAddress,
    defaultFromName: fromName,
    sendEmail: async (message: nodemailer.SendMailOptions) => {
      try {
        await transport.sendMail({ from: `${fromName} <${fromAddress}>`, ...message })
      } catch (err) {
        console.error('[Email] Failed to send to', message.to, err instanceof Error ? err.message : String(err))
        // Intentionally swallowed — prevents transport errors from breaking forgot-password / user-verify
      }
    },
  })
}

async function seedPlugins(payload: Awaited<ReturnType<typeof import('payload').getPayload>>) {
  try {
    const existing = await payload.find({
      collection: 'plugins',
      where: { slug: { equals: PLUGIN_METADATA.slug } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'plugins',
        data: {
          name: PLUGIN_METADATA.name,
          slug: PLUGIN_METADATA.slug,
          description: PLUGIN_METADATA.description,
          version: PLUGIN_METADATA.version,
          status: 'inactive',
        },
      })
    }
  } catch {
    // Silently skip on first boot before migrations run
  }
}

export default buildConfig({
  // Admin panel configuration
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    // autoLogin: process.env.NODE_ENV !== 'production'
    //   ? { email: 'dev@atech.software', prefillOnly: false }
    //   : false,
    meta: {
      titleSuffix: ' — Atombondway Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#AdminLogo',
        Icon: '@/components/admin/Icon#AdminIcon',
      },
      views: {
        BackupRestore: {
          Component: '@/plugins/backup-restore/BackupView#BackupView',
          path: '/plugins/backup',
        },
      },
    },
  },

  // CORS & CSRF origins (top-level, not inside admin)
  cors: allowedOrigins,
  csrf: allowedOrigins,

  // Collections & Globals
  collections: [Users, Media, Projects, ProjectCategory, Products, ProductCategory, Plugins],
  globals: [SiteSettings, Navigation, HomePage, ProductsPage, ProjectsPage, ServicesPage, AboutPage, FooterSettings, CustomCSS],

  // Localization: English + Traditional Chinese
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: '中文', code: 'zh' },
    ],
    defaultLocale: 'zh',
    fallback: true,
  },

  // Database: SQLite via libsql
  // IMPORTANT: Use fork mode (not cluster) in PM2 — SQLite is single-writer
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || `file:${path.resolve(dirname, './data/payload.db')}`,
    },
    migrationDir: path.resolve(dirname, './src/migrations'),
    push: false,
  }),

  // Rich text editor
  editor: lexicalEditor(),

  // Email: AWS SES (prod) or silent JSON transport (dev/fallback)
  email: buildEmailAdapter(),

  // Server URL (required for Payload admin to work correctly)
  serverURL: payloadServerUrl,

  // Security
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-THIS-SECRET-IN-PRODUCTION',

  // TypeScript types output
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  // Admin UI language support
  i18n: {
    supportedLanguages: { en, zh },
  },

  // Image processing (required for thumbnail generation)
  sharp,

  // Upload size limit: 10MB
  upload: {
    limits: {
      fileSize: 10_000_000,
    },
  },

  onInit: async (payload) => {
    await seedPlugins(payload)
  },
})
