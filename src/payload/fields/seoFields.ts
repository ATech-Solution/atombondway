import type { Field } from 'payload'

export const seoFields: Field[] = [
  {
    name: 'meta',
    type: 'group',
    label: 'SEO Metadata',
    admin: {
      description: 'Configure search engine and social media metadata for this content.',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Meta Title',
        localized: true,
        admin: {
          description: 'Page title shown in search results. Recommended: 50–60 characters.',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Meta Description',
        localized: true,
        admin: {
          description: 'Summary shown in search results. Recommended: 150–160 characters.',
        },
      },
      {
        name: 'keywords',
        type: 'text',
        label: 'Keywords',
        localized: true,
        admin: {
          description: 'Comma-separated keywords (optional).',
        },
      },
      {
        name: 'ogImage',
        type: 'upload',
        label: 'Social Share Image',
        relationTo: 'media',
        admin: {
          description: 'Image shown when shared on social media. Recommended: 1200×630px.',
        },
      },
      {
        name: 'noIndex',
        type: 'checkbox',
        label: 'Exclude from search engines (noindex)',
        defaultValue: false,
        admin: {
          position: 'sidebar',
        },
      },
    ],
  },
]
