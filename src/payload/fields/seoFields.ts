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
        validate: (value: string | null | undefined) => {
          if (!value) return true
          if (value.length > 60) {
            return `Meta title is ${value.length} characters. Search engines typically truncate titles over 60 characters — please shorten it.`
          }
          if (value.length < 10) {
            return 'Meta title is too short. Aim for at least 10 characters so search results are informative.'
          }
          return true
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
        validate: (value: string | null | undefined) => {
          if (!value) return true
          if (value.length > 160) {
            return `Meta description is ${value.length} characters. Search engines truncate descriptions over 160 characters — please shorten it.`
          }
          if (value.length < 50) {
            return 'Meta description is too short. Aim for at least 50 characters to provide a useful search result snippet.'
          }
          return true
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
        validate: (value: string | null | undefined) => {
          if (!value) return true
          const keywords = value.split(',').map((k) => k.trim()).filter(Boolean)
          if (keywords.length > 20) {
            return `Too many keywords (${keywords.length}). Keep it to 20 or fewer for best practice.`
          }
          return true
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
