import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'

export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  label: 'Footer Settings',
  admin: {
    description: 'Manage footer content: contact info visibility, copyright, and back-to-top button.',
    group: 'Layout',
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
          label: 'Footer Top',
          fields: [
            {
              name: 'showContactInfo',
              type: 'checkbox',
              label: 'Show Contact Details in Footer',
              defaultValue: true,
              admin: {
                description: 'Display address, phone, email and fax from Layout > Contact Information in the footer top section.',
              },
            },
          ],
        },
        {
          label: 'Footer Bottom',
          fields: [
            {
              name: 'copyrightText',
              type: 'text',
              label: 'Copyright Text',
              localized: true,
              admin: {
                description: 'e.g. "© 2025 Company Name. All rights reserved."',
              },
            },
            {
              name: 'showBackToTop',
              type: 'checkbox',
              label: 'Show Back to Top Button',
              defaultValue: true,
              admin: {
                description: 'Display a scroll-to-top arrow button in the footer bottom bar.',
              },
            },
          ],
        },
      ],
    },
  ],
}
