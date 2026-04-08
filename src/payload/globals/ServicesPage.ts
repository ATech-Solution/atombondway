import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const ServicesPage: GlobalConfig = {
  slug: 'services-page',
  label: 'Services',
  admin: {
    description: 'Edit the Services page title, intro text, and individual service items (via Collections > Services).',
    group: 'Pages',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page Content',
          fields: [
            {
              name: 'pageTitle',
              type: 'text',
              label: 'Page Title',
              localized: true,
              defaultValue: 'Our Services',
              admin: {
                description: 'Main heading shown at the top of the Services page.',
              },
            },
            {
              name: 'pageSubtitle',
              type: 'richText',
              label: 'Intro Text',
              localized: true,
              admin: {
                description: 'Introductory content below the page title. Supports bold, lists, links, images, etc.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: seoFields,
        },
      ],
    },
  ],
}
