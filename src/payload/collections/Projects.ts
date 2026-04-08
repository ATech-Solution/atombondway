import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'
import { slugField } from '../fields/slugField'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Projects',
    defaultColumns: ['title', 'projectCategory', 'featured', 'order', 'publishedAt'],
    description: 'Manage completed and ongoing projects for the portfolio section.',
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
      label: 'Project Title',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'summary',
      type: 'textarea',
      label: 'Short Summary',
      localized: true,
      admin: {
        description: 'Brief description shown in cards and listings (1–2 sentences).',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Full Description',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Cover Image',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Image Gallery',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'projectCategory',
      type: 'relationship',
      label: 'Project Category',
      relationTo: 'project-categories',
      admin: {
        position: 'sidebar',
        description: 'Select from the Project Categories collection.',
      },
    },
    {
      name: 'architect',
      type: 'text',
      label: 'Architect',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'developer',
      type: 'text',
      label: 'Developer',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'materialSupplied',
      type: 'text',
      label: 'Material Supplied',
      admin: { position: 'sidebar' },
    },
    {
      name: 'buildingType',
      type: 'text',
      label: 'Building Type',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'completionDate',
      type: 'date',
      label: 'Completion Date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured on Homepage',
      defaultValue: false,
      admin: { position: 'sidebar' },
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
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    ...seoFields,
  ],
}
