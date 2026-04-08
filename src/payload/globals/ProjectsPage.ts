import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const ProjectsPage: GlobalConfig = {
  slug: 'projects-page',
  label: 'Projects',
  admin: {
    description: 'Manage the Projects listing page title, subtitle, and SEO metadata.',
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
      defaultValue: 'Our Projects',
      admin: {
        description: 'Main heading shown at the top of the Projects page.',
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
