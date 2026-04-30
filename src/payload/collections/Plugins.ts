import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../access/index.ts'

export const Plugins: CollectionConfig = {
  slug: 'plugins',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'version'],
    description: 'Manage site plugins — enable or disable features.',
    group: 'System',
  },
  access: {
    read: isAuthenticated,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Plugin Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      label: 'Slug',
      admin: {
        description: 'Unique identifier for this plugin. Do not change after creation.',
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0',
      label: 'Version',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'inactive',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Enable or disable this plugin.',
      },
    },
    {
      name: 'config',
      type: 'json',
      label: 'Plugin Configuration',
      admin: {
        description: 'Plugin-specific settings as JSON. See plugin documentation for available options.',
      },
    },
  ],
}
