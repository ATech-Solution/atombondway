import type { GlobalConfig } from 'payload'
import { isAuthenticated, isPublic } from '../access/index.ts'
import { revalidateGlobalOnChange } from '../hooks/revalidate.ts'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home',
  admin: {
    group: 'Pages',
    description: 'Edit homepage sections. Hero → Content > Hero Section. Services → Content > Services Section. About → Content > About Section. ',
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
        // ── Hero ──────────────────────────────────────────────
        {
          label: 'Hero',
          description: 'Controls the Hero section on the homepage.',
          fields: [
            {
              name: 'heroSectionTitle',
              type: 'text',
              label: 'Section Title',
              localized: true,
              defaultValue: 'WE SEAL THE SUCCESS OF HONG KONG',
            },
            {
              name: 'heroSectionBody',
              type: 'richText',
              label: 'Content Body',
              localized: true,
            },
            {
              name: 'heroSectionCtaText',
              type: 'text',
              label: 'CTA Button Text',
              localized: true,
              defaultValue: 'TELL ME MORE',
            },
            {
              name: 'heroSectionCtaHref',
              type: 'text',
              label: 'CTA Button Link',
              defaultValue: '/about',
            },
            {
              name: 'heroSectionbackgroundImage',
              type: 'upload',
              label: 'Background Image',
              relationTo: 'media',
              admin: {
                description: 'Recommended: 1920×1080px or wider. A dark overlay is applied automatically.',
              },
            },
            {
              name: 'heroSectionoverlayOpacity',
              type: 'number',
              label: 'Dark Overlay Opacity (0–100)',
              defaultValue: 50,
              min: 0,
              max: 100,
              admin: {
                description: 'Controls the darkness of the overlay on the background image.',
              },
            },
          ],
        },
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
                description: 'By Default already set to 3 main category (SILICONE SEALANTS,SPACER TAPES and SUCTION GRIPS). Configure up to 4 product category cards to display. Only used when Option 2 is selected.',
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
        
        // ── Our Services ──────────────────────────────────────────────
        {
          label: 'Our Services',
          description: 'Controls the Services section on the homepage.',
          fields: [
            {
              name: 'servicesSectionTitle',
              type: 'text',
              label: 'Section Title',
              localized: true,
              defaultValue: 'OUR SERVICES',
            },
            {
              name: 'servicesSectionCtaText',
              type: 'text',
              label: 'CTA Button Text',
              localized: true,
              defaultValue: 'VIEW MORE',
            },
            {
              name: 'servicesSectionCtaHref',
              type: 'text',
              label: 'CTA Button Link',
              defaultValue: '/services',
            },
            {
              name: 'servicesSectionHighlights',
              type: 'array',
              label: 'Service Highlights',
              localized: true,
              admin: {
                description: 'Key numbers displayed as highlighted service.',
              },
              fields: [
                { name: 'servicesSectionHighlightsTitle', type: 'text', label: 'Title', required: true },
                { name: 'servicesSectionHighlightsDescription', type: 'textarea', label: 'Description' },
                {
                  name: 'servicesSectionHighlightsImage',
                  type: 'upload',
                  label: 'Highlight Image',
                  relationTo: 'media',
                  admin: {
                    description: 'Image displayed alongside the highlight.',
                  },
                },
              ],
            },
          ],
        },
        
        // ── About us ──────────────────────────────────────────────
        {
          label: 'About Us',
          description: 'Controls the About section on the homepage.',
          fields: [
            {
              name: 'aboutSectionTitle',
              type: 'text',
              label: 'Section Title',
              localized: true,
              defaultValue: 'ABOUT US',
            },
            {
              name: 'aboutSectionBody',
              type: 'richText',
              label: 'Content Body',
              localized: true,
            },
            {
              name: 'aboutSectionCtaText',
              type: 'text',
              label: 'CTA Button Text',
              localized: true,
              defaultValue: 'VIEW MORE',
            },
            {
              name: 'aboutSectionCtaHref',
              type: 'text',
              label: 'CTA Button Link',
              defaultValue: '/about',
            },
          ],
        },

        // ── SEO ───────────────────────────────────────────────
        {
          label: 'SEO',
          description: 'Homepage-specific SEO settings. Falls back to General Settings → Default SEO if left empty.',
          fields: [
            {
              name: 'seoTitle',
              type: 'text',
              label: 'Meta Title',
              localized: true,
              admin: {
                description: 'Recommended: 50–60 characters. Shown in browser tabs and search results.',
              },
            },
            {
              name: 'seoDescription',
              type: 'textarea',
              label: 'Meta Description',
              localized: true,
              admin: {
                description: 'Recommended: 120–160 characters. Shown under the page title in search results.',
              },
            },
            {
              name: 'seoKeywords',
              type: 'text',
              label: 'Keywords',
              localized: true,
              admin: {
                description: 'Comma-separated keywords (optional).',
              },
            },
            {
              name: 'seoOgImage',
              type: 'upload',
              label: 'Social Share Image (OG Image)',
              relationTo: 'media',
              admin: {
                description: 'Recommended: 1200×630px. Used when the page is shared on social media.',
              },
            },
          ],
        },
      ],
    },
  ],
}
