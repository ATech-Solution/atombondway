import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'
import { slugField } from '../fields/slugField'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'updatedAt'],
    description: 'Manage services displayed in the Services section.',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Service Title',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
      localized: true,
      admin: {
        description: 'Brief description shown in the services grid (2–3 sentences).',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Full Description',
      localized: true,
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon Name',
      admin: {
        description:
          'Lucide icon name (e.g. "wrench", "shield-check", "file-check", "award"). Browse icons at lucide.dev.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Service Image',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
    ...seoFields,
  ],
}
