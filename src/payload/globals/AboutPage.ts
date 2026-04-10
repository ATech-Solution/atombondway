import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { seoFields } from '../fields/seoFields.ts'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Us',
  admin: {
    group: 'Pages',
    description: 'Edit the About Us page content.',
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
              defaultValue: 'About Atom Bondway',
            },
            {
              name: 'pageBody',
              type: 'richText',
              label: 'Company Description',
              localized: true,
              admin: {
                description: 'Main company introduction. Supports bold, italic, lists, links, images, etc.',
              },
            },
            {
              name: 'visionTitle',
              type: 'text',
              label: 'Vision Section Title',
              localized: true,
              defaultValue: 'Vision',
            },
            {
              name: 'visionBody',
              type: 'richText',
              label: 'Vision Text',
              localized: true,
            },
            {
              name: 'missionTitle',
              type: 'text',
              label: 'Mission Section Title',
              localized: true,
              defaultValue: 'Mission',
            },
            {
              name: 'missionBody',
              type: 'richText',
              label: 'Mission Text',
              localized: true,
            },
            {
              name: 'partnersTitle',
              type: 'text',
              label: 'Partners Section Title',
              localized: true,
              defaultValue: 'Partners',
            },
            {
              name: 'partners',
              type: 'array',
              label: 'Partner Logos',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Partner Name',
                  required: true,
                },
                {
                  name: 'logo',
                  type: 'upload',
                  label: 'Logo Image',
                  relationTo: 'media',
                },
                {
                  name: 'logoUrl',
                  type: 'text',
                  label: 'Logo URL (external)',
                  admin: {
                    description: 'Use if logo is hosted externally. Leave blank to use the uploaded logo.',
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
