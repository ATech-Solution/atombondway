import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'General Settings',
  admin: {
    group: 'Settings',
    description: 'Global site identity, domain, default SEO configuration, and indexing settings.',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      label: 'Company Name',
      required: true,
      localized: true,
      defaultValue: 'Company Name',
    },
    {
      name: 'domain',
      type: 'text',
      label: 'Production Domain',
      admin: {
        description:
          'Your live site URL including https:// (e.g. https://yourdomain.com). Used for canonical URLs and SEO.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Company Logo',
      relationTo: 'media',
      admin: {
        description: 'Recommended: SVG or PNG with transparent background, max height 60px.',
      },
    },
    {
      name: 'logoLight',
      type: 'upload',
      label: 'Company Logo (Light / White)',
      relationTo: 'media',
      admin: {
        description: 'White version of the logo for use on dark backgrounds.',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      label: 'Favicon',
      relationTo: 'media',
      admin: {
        description: 'Recommended: 32×32px PNG or ICO file.',
      },
    },
    {
      name: 'defaultMeta',
      type: 'group',
      label: 'Default SEO (Fallback)',
      admin: {
        description:
          'Used on pages that do not have their own meta title/description configured.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Default Meta Title',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Default Meta Description',
          localized: true,
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Default Keywords',
          localized: true,
        },
        {
          name: 'ogImage',
          type: 'upload',
          label: 'Default Social Share Image',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'stickyHeader',
      type: 'checkbox',
      label: 'Sticky Header',
      defaultValue: false,
      admin: {
        description: 'When enabled, the header stays fixed at the top of the page while scrolling.',
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: 'Exclude from search engines (noindex)',
      defaultValue: false,
      admin: {
        description: 'When enabled, adds a noindex meta tag to all pages, preventing search engines from indexing the site.',
      },
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Social Media Links',
      admin: {
        description: 'Enter full URLs including https:// for each platform.',
      },
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
        { name: 'twitter', type: 'text', label: 'Twitter / X URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
        { name: 'youtube', type: 'text', label: 'YouTube URL' },
        { name: 'whatsapp', type: 'text', label: 'WhatsApp Number (with country code)' },
      ],
    },
  ],
}
