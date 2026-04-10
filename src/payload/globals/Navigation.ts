import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation Menu',
  admin: {
    group: 'Settings',
    description: 'Manage the main site navigation links.',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Navigation Items',
      admin: {
        description: 'Drag to reorder. Add sub-items for dropdown menus.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
          localized: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link',
          required: true,
          admin: {
            description: 'Use relative paths: /about, /projects, /contact',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in new tab',
          defaultValue: false,
        },
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown Items',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
              localized: true,
            },
            {
              name: 'href',
              type: 'text',
              label: 'Link',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
