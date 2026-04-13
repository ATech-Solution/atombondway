import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { revalidateGlobalOnChange } from '../hooks/revalidate.ts'
import { seoFields } from '../fields/seoFields.ts'

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
  hooks: {
    afterChange: [revalidateGlobalOnChange],
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
              defaultValue: 'Who We Are',
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
            {
              name: 'values',
              type: 'array',
              label: 'Value Services',
              localized: true,
              admin: {
                description: 'Key numbers displayed as highlighted service.',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Value Name',
                  required: true,
                },
                {
                  name: 'logo',
                  type: 'upload',
                  label: 'Value Image',
                  relationTo: 'media',
                  admin: {
                    description: 'Image displayed alongside the value.',
                  },
                },
                {
                  name: 'description',
                  type: 'richText',
                  label: 'Value Description',
                  admin: {
                    description: 'Value description content. Supports bold, lists, links, images, etc.',
                  },
                },
              ],
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
