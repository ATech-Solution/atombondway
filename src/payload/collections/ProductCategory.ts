import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { slugField } from '../fields/slugField.ts'

export const ProductCategory: CollectionConfig = {
  slug: 'product-categories',
  admin: {
    useAsTitle: 'title',
    group: 'Products',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Product categories used to group products in the catalogue.',
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
      label: 'Category Name',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'image',
      type: 'upload',
      label: 'Category Image',
      relationTo: 'media',
      admin: {
        description: 'Representative image for this category.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },
  ],
}
