import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const HeroContent: GlobalConfig = {
  slug: 'hero-content',
  label: 'Hero Section',
  admin: {
    group: 'Content',
    description: 'Manage the hero (banner) section shown at the top of the homepage.',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Main Heading',
      required: true,
      localized: true,
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading / Tagline',
      localized: true,
    },
    {
      name: 'ctaPrimary',
      type: 'group',
      label: 'Primary CTA Button',
      fields: [
        { name: 'text', type: 'text', label: 'Button Text', localized: true },
        { name: 'href', type: 'text', label: 'Button Link' },
      ],
    },
    // {
    //   name: 'ctaSecondary',
    //   type: 'group',
    //   label: 'Secondary CTA Button (Optional)',
    //   fields: [
    //     { name: 'text', type: 'text', label: 'Button Text', localized: true },
    //     { name: 'href', type: 'text', label: 'Button Link' },
    //   ],
    // },
    {
      name: 'backgroundImage',
      type: 'upload',
      label: 'Background Image',
      relationTo: 'media',
      admin: {
        description: 'Recommended: 1920×1080px or wider. A dark overlay is applied automatically.',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      label: 'Dark Overlay Opacity (0–100)',
      defaultValue: 50,
      min: 0,
      max: 100,
      admin: {
        description: 'Controls the darkness of the overlay on the background image.',
      },
    },
    ...seoFields,
  ],
}
