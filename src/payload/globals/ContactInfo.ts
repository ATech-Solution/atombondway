import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: 'Contact Information',
  admin: {
    group: 'Layout',
    description: 'Company contact details shown in the footer and contact page.',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
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
    ...seoFields,
  ],
}
