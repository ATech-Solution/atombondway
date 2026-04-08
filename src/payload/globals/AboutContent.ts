import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const AboutContent: GlobalConfig = {
  slug: 'about-content',
  label: 'About Section',
  admin: {
    group: 'Content',
    description: 'Manage the About Us page and homepage About section content.',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'sectionLabel',
      type: 'text',
      label: 'Section Label (eyebrow text)',
      localized: true,
      admin: { description: 'Small text shown above the heading (e.g. "About Us").' },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      localized: true,
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Content Body',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Section Image',
      relationTo: 'media',
      admin: {
        description: 'Image displayed alongside the about text.',
      },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Company Statistics',
      localized: true,
      admin: {
        description: 'Key numbers displayed as highlighted stats (e.g. "20+ Years Experience").',
      },
      fields: [
        { name: 'value', type: 'text', label: 'Stat Value', required: true },
        { name: 'label', type: 'text', label: 'Stat Label', required: true },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Key Highlights / Features',
      localized: true,
      fields: [
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon Name',
          admin: { description: 'Lucide icon name (e.g. "check-circle", "star")' },
        },
      ],
    },
    ...seoFields,
  ],
}
