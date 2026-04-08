/**
 * Renders Payload CMS Lexical rich text output using the official WYSIWYG editor.
 */

'use client'

import { RichText as LexicalRichText, defaultJSXConverters, UploadJSXConverter } from '@payloadcms/richtext-lexical/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Props {
  data: any
}

export default function RichText({ data }: Props) {
  const { locale } = useParams() as { locale: string }

  const converters = ({ defaultConverters }: { defaultConverters: any }) => {
    return {
      ...defaultConverters,
      ...UploadJSXConverter,
      link: ({ node, nodesToJSX, converters }: { node: any; nodesToJSX: any; converters: any }) => {
        const { fields } = node
        const { doc, linkType, url, newTab } = fields

        let href = '#'
        let isExternal = false

        if (linkType === 'custom') {
          href = url || '#'
          isExternal = true
        } else if (doc) {
          const { value, relationTo } = doc

          // Handle media relations (PDFs, documents, etc.)
          if (relationTo === 'media') {
            if (typeof value === 'object' && value !== null) {
              href = (value as any).url || '#'
              isExternal = true
            } else if (typeof value === 'number') {
              // If it's just an ID, we can't resolve it here
              // The preprocessing should have converted it to an object
              href = '#'
            }
          }

          // Handle different relation types (internal Next.js navigation)
          else if (relationTo === 'products') {
            if (typeof value === 'object' && value !== null) {
              const slug = (value as any).slug
              href = `/${locale}/products/${slug || (value as any).id || ''}`
            } else if (typeof value === 'number') {
              href = `/${locale}/products/${value}`
            }
          } else if (relationTo === 'projects') {
            if (typeof value === 'object' && value !== null) {
              const slug = (value as any).slug
              href = `/${locale}/projects/${slug || (value as any).id || ''}`
            } else if (typeof value === 'number') {
              href = `/${locale}/projects/${value}`
            }
          } else if (relationTo === 'services') {
            href = `/${locale}/services`
          } else {
            // For other relations, use generic pattern
            if (typeof value === 'object' && value !== null) {
              const slug = (value as any).slug
              const id = (value as any).id
              href = `/${locale}/${relationTo}/${slug || id || ''}`
            } else if (typeof value === 'number') {
              href = `/${locale}/${relationTo}/${value}`
            }
          }
        }

        // Convert child nodes to JSX
        const children = nodesToJSX({ converters, nodes: node.children || [] })

        // Use <a> tag for external links and PDFs
        if (isExternal || linkType === 'custom' || (doc && doc.relationTo === 'media')) {
          return (
            <a
              href={href}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          )
        }
        // Use Next.js Link for internal navigation
        return <Link href={href}>{children}</Link>
      },
    }
  }

  return <LexicalRichText data={data} converters={converters} />
}
