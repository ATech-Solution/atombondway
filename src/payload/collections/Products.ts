import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { seoFields } from '../fields/seoFields.ts'
import { slugField } from '../fields/slugField.ts'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate.ts'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Products',
    defaultColumns: ['name', 'productCategory', 'featured', 'order', 'updatedAt'],
    description: 'Manage products displayed in the Products section.',
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
      name: 'name',
      type: 'text',
      label: 'Product Name',
      required: true,
      localized: true,
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length === 0) return 'Product name is required.'
        if (value.trim().length < 2) return 'Product name must be at least 2 characters.'
        if (value.length > 150) return `Product name is too long (${value.length} characters). Keep it under 150 characters.`
        return true
      },
    },
    slugField('name'),
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline / Short Description',
      localized: true,
      admin: {
        description: 'One-line description shown in cards.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.length > 200) {
          return `Tagline is too long (${value.length} characters). Keep it under 200 characters — it should be a single line.`
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
      name: 'image',
      type: 'upload',
      label: 'Product Image',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Additional Images',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'productCategory',
      type: 'relationship',
      label: 'Product Category',
      relationTo: 'product-categories',
      admin: {
        position: 'sidebar',
        description: 'Select from the Product Categories collection.',
      },
    },
    {
      name: 'subcategory',
      type: 'text',
      label: 'Subcategory',
      localized: true,
      admin: {
        position: 'sidebar',
        description: 'Optional sub-group shown as a section heading within the category page.',
      },
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
    ...seoFields,
  ],
}
