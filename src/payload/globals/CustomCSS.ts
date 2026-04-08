import type { GlobalConfig } from 'payload'
import { isAdmin, isPublic } from '../access'

export const CustomCSS: GlobalConfig = {
  slug: 'custom-css',
  label: 'Custom CSS',
  admin: {
    group: 'Layout',
    description: 'Inject custom CSS that will be applied globally across the entire frontend site.',
  },
  access: {
    read: isPublic,
    update: isAdmin, // Restricted: bad CSS can break the entire frontend
  },
  fields: [
    {
      name: 'css',
      type: 'code',
      label: 'Custom CSS',
      admin: {
        language: 'css',
        description:
          'Write valid CSS here. It will be injected into a <style> tag on every page. Use carefully — bad CSS can break the layout.',
      },
    },
  ],
}
