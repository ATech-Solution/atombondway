import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const ProductsPage: GlobalConfig = {
  slug: 'products-page',
  label: 'Products',
  admin: {
    description: 'Manage the Products listing page title, subtitle, and SEO metadata.',
    group: 'Pages',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'pageTitle',
      type: 'text',
      label: 'Page Title',
      required: true,
      localized: true,
      defaultValue: 'Our Products',
      admin: {
        description: 'Main heading shown at the top of the Products page.',
      },
    },
    {
      name: 'pageSubtitle',
      type: 'textarea',
      label: 'Page Subtitle / Intro',
      localized: true,
      admin: {
        description: 'Short introductory paragraph below the page title.',
      },
    },
    ...seoFields,
  ],
}
