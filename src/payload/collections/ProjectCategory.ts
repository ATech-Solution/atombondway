import type { CollectionConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { slugField } from '../fields/slugField.ts'

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
