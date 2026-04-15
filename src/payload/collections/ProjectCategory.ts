import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { slugField } from '../fields/slugField.ts'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate.ts'

export const ProjectCategory: CollectionConfig = {
  slug: 'project-categories',
  admin: {
    useAsTitle: 'title',
    group: 'Projects',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Project categories used to filter and group projects.',
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
      label: 'Category Name',
      required: true,
      localized: true,
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length === 0) return 'Category name is required.'
        if (value.trim().length < 2) return 'Category name must be at least 2 characters.'
        if (value.length > 100) return `Category name is too long (${value.length} characters). Keep it under 100 characters.`
        return true
      },
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
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (value.length > 500) {
          return `Description is too long (${value.length} characters). Keep it under 500 characters.`
        }
        return true
      },
    },
  ],
}
