import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { seoFields } from '../fields/seoFields.ts'
import { slugField } from '../fields/slugField.ts'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate.ts'

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
  hooks: {
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Project Title',
      required: true,
      localized: true,
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length === 0) return 'Project title is required.'
        if (value.trim().length < 2) return 'Project title must be at least 2 characters.'
        if (value.length > 200) return `Project title is too long (${value.length} characters). Keep it under 200 characters.`
        return true
      },
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
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.length > 400) {
          return `Summary is too long (${value.length} characters). Keep it under 400 characters — it should be 1–2 sentences.`
        }
        return true
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
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.trim().length < 2) return 'Architect name must be at least 2 characters.'
        if (value.length > 150) return `Architect name is too long (${value.length} characters). Keep it under 150 characters.`
        return true
      },
    },
    {
      name: 'developer',
      type: 'text',
      label: 'Developer',
      localized: true,
      admin: { position: 'sidebar' },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.trim().length < 2) return 'Developer name must be at least 2 characters.'
        if (value.length > 150) return `Developer name is too long (${value.length} characters). Keep it under 150 characters.`
        return true
      },
    },
    {
      name: 'materialSupplied',
      type: 'text',
      label: 'Material Supplied',
      admin: { position: 'sidebar' },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.trim().length < 2) return 'Material supplied must be at least 2 characters.'
        if (value.length > 200) return `Material supplied is too long (${value.length} characters). Keep it under 200 characters.`
        return true
      },
    },
    {
      name: 'buildingType',
      type: 'text',
      label: 'Building Type',
      localized: true,
      admin: { position: 'sidebar' },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.trim().length < 2) return 'Building type must be at least 2 characters.'
        if (value.length > 100) return `Building type is too long (${value.length} characters). Keep it under 100 characters.`
        return true
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      localized: true,
      admin: { position: 'sidebar' },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.trim().length < 2) return 'Location must be at least 2 characters.'
        if (value.length > 200) return `Location is too long (${value.length} characters). Keep it under 200 characters.`
        return true
      },
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
      validate: (value: number | null | undefined) => {
        if (value === null || value === undefined) return true
        if (!Number.isInteger(value)) return 'Sort order must be a whole number (e.g. 0, 1, 2).'
        if (value < 0) return 'Sort order cannot be negative. Use 0 or a positive number.'
        if (value > 9999) return 'Sort order cannot exceed 9999.'
        return true
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
