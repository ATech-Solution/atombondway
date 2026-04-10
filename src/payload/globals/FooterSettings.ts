import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'

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
              name: 'title',
              type: 'text',
              label: 'Section Title',
              localized: true,
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Office Address',
              localized: true,
            },
            {
              name: 'email',
              type: 'email',
              label: 'Contact Email',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Phone Number',
            },
            {
              name: 'fax',
              type: 'text',
              label: 'Fax Number',
            },
            {
              name: 'businessHours',
              type: 'textarea',
              label: 'Business Hours',
              localized: true,
              admin: {
                description: 'e.g. Mon–Fri: 9:00am – 6:00pm',
              },
            },
            {
              name: 'mapEmbedUrl',
              type: 'text',
              label: 'Google Maps Embed URL',
              admin: {
                description:
                  'Go to Google Maps → Share → Embed a map → Copy only the src="..." URL from the iframe code.',
              },
            },
            {
              name: 'contactFormEnabled',
              type: 'checkbox',
              label: 'Show Contact Form',
              defaultValue: true,
              admin: {
                description: 'Display the contact form on the Contact page.',
              },
            },
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
