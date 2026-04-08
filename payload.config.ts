import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import nodemailer from 'nodemailer'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'
import { Projects } from './src/payload/collections/Projects'
import { ProjectCategory } from './src/payload/collections/ProjectCategory'
import { Products } from './src/payload/collections/Products'
import { ProductCategory } from './src/payload/collections/ProductCategory'
import { Services } from './src/payload/collections/Services'

import { SiteSettings } from './src/payload/globals/SiteSettings'
import { HeroContent } from './src/payload/globals/HeroContent'
import { AboutContent } from './src/payload/globals/AboutContent'
import { ContactInfo } from './src/payload/globals/ContactInfo'
import { Navigation } from './src/payload/globals/Navigation'
import { ProductsPage } from './src/payload/globals/ProductsPage'
import { ProjectsPage } from './src/payload/globals/ProjectsPage'
import { FooterSettings } from './src/payload/globals/FooterSettings'
import { CustomCSS } from './src/payload/globals/CustomCSS'
import { HomePage } from './src/payload/globals/HomePage'
import { AboutPage } from './src/payload/globals/AboutPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


/**
 * Email transport:
 * - Production: AWS SES via SMTP (set AWS_SES_SMTP_USER in .env)
 * - Development/fallback: Mailpit (run: docker run -p 1025:1025 -p 8025:8025 axllent/mailpit)
 */
const emailTransport = process.env.AWS_SES_SMTP_USER
  ? nodemailer.createTransport({
      host: process.env.AWS_SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
      port: parseInt(process.env.AWS_SES_SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.AWS_SES_SMTP_USER,
        pass: process.env.AWS_SES_SMTP_PASSWORD,
      },
    })
  : process.env.MAILPIT_HOST
    ? nodemailer.createTransport({
        host: process.env.MAILPIT_HOST,
        port: parseInt(process.env.MAILPIT_PORT || '1025'),
        secure: false,
      })
    // No email provider configured — use silent JSON transport (dev/seed mode)
    : nodemailer.createTransport({ jsonTransport: true })

export default buildConfig({
  // Admin panel configuration
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    // autoLogin: process.env.NODE_ENV !== 'production'
    //   ? { email: 'tan@atech.software', prefillOnly: false }
    //   : false,
    meta: {
      titleSuffix: ' — Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#AdminLogo',
        Icon: '@/components/admin/Icon#AdminIcon',
      },
    },
  },

  // CORS & CSRF origins (top-level, not inside admin)
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ],
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ],

  // Collections & Globals
  collections: [Users, Media, Projects, ProjectCategory, Products, ProductCategory, Services],
  globals: [SiteSettings, HeroContent, AboutContent, ContactInfo, Navigation, ProductsPage, ProjectsPage, AboutPage, FooterSettings, CustomCSS, HomePage],

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

  // Email: AWS SES (prod) or Mailpit (dev)
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Company Profile',
    transport: emailTransport,
    skipVerify: true, // Add this line to skip the connection check
  }),

  // Server URL (required for Payload admin to work correctly)
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

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
  // sharp,

  // Upload size limit: 10MB
  upload: {
    limits: {
      fileSize: 10_000_000,
    },
  },
})
