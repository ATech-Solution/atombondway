import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access'
import { seoFields } from '../fields/seoFields'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home',
  admin: {
    group: 'Pages',
    description: 'Edit homepage sections. Hero → Content > Hero Section. About → Content > About Section. Services → Collections > Services.',
  },
  access: {
    read: isPublic,
    update: isAuthenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Recent Projects ────────────────────────────────────────────────
        {
          label: 'Recent Projects',
          description: 'Controls the Recent Projects carousel section on the homepage.',
          fields: [
            {
              name: 'projectsSectionLabel',
              type: 'text',
              label: 'Eyebrow Label',
              localized: true,
              defaultValue: 'WHAT WE DO',
              admin: { description: 'Small uppercase text above the section title.' },
            },
            {
              name: 'projectsSectionTitle',
              type: 'text',
              label: 'Section Title',
              localized: true,
              defaultValue: 'RECENT PROJECTS',
            },
            {
              name: 'projectsCtaText',
              type: 'text',
              label: 'CTA Button Text',
              localized: true,
              defaultValue: 'VIEW MORE',
            },
            {
              name: 'projectsCtaHref',
              type: 'text',
              label: 'CTA Button Link',
              defaultValue: '/projects',
            },
          ],
        },

        // ── Featured Products ──────────────────────────────────────────────
        {
          label: 'Featured Products',
          description: 'Controls the Featured Products section on the homepage.',
          fields: [
            {
              name: 'featuredProductsTitle',
              type: 'text',
              label: 'Section Title',
              localized: true,
              defaultValue: 'OUR FEATURED PRODUCTS',
            },
            {
              name: 'featuredProductsMode',
              type: 'radio',
              label: 'Display Mode',
              defaultValue: 'featured_products',
              options: [
                {
                  label: 'Option 1 — Show Featured Products (marked as featured in Products collection)',
                  value: 'featured_products',
                },
                {
                  label: 'Option 2 — Show Product Category Links (linked to category pages)',
                  value: 'category_links',
                },
              ],
              admin: {
                layout: 'vertical',
              },
            },
            // Option 2 fields: category links
            {
              name: 'featuredCategoryLinks',
              type: 'array',
              label: 'Category Links (Option 2 only)',
              maxRows: 4,
              admin: {
                description: 'Configure up to 4 product category cards to display. Only used when Option 2 is selected.',
                condition: (data: any) => data?.featuredProductsMode === 'category_links',
              },
              fields: [
                {
                  name: 'categorySlug',
                  type: 'select',
                  label: 'Product Category',
                  required: true,
                  options: [
                    { label: 'DOWSIL™ Sealants', value: 'silicone-sealants' },
                    { label: 'Saint-Gobain Spacer Tapes', value: 'spacer-tapes' },
                    { label: "Wood's Powr-Grip", value: 'suction-grip' },
                    { label: 'Backer Rod', value: 'backer-rod' },
                  ],
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Display Label (overrides default category name)',
                  localized: true,
                },
                {
                  name: 'image',
                  type: 'upload',
                  label: 'Card Image',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },

        // ── SEO ───────────────────────────────────────────────────────────
        {
          label: 'SEO',
          fields: seoFields,
        },
      ],
    },
  ],
}
