/**
 * Renders Payload CMS Lexical rich text output.
 *
 * This component handles the serialized Lexical JSON format.
 * For a full implementation, use @payloadcms/richtext-lexical/react.
 * This lightweight version handles common nodes: paragraph, heading, list, quote.
 */

type LexicalNode = {
  type: string
  version?: number
  tag?: string
  format?: number
  indent?: number
  direction?: string
  children?: LexicalNode[]
  text?: string
  url?: string
  mode?: string
  style?: string
  detail?: number
  // Payload v3 Lexical link fields
  fields?: {
    linkType?: 'custom' | 'internal'
    url?: string
    newTab?: boolean
    doc?: {
      relationTo: string
      value: number | { url?: string; filename?: string }
    }
  }
  // Payload v3 Lexical upload/image node
  relationTo?: string
  value?: number | {
    id?: number
    url?: string
    filename?: string
    alt?: string
    width?: number
    height?: number
    mimeType?: string
  }
}

type FileType = 'pdf' | 'word' | 'excel' | 'zip' | 'image' | 'video' | 'audio' | 'external' | 'internal'

function detectFileType(url: string): FileType {
  if (!url || url === '#') return 'internal'
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.match(/\.(docx?|odt|rtf)$/)) return 'word'
  if (lower.match(/\.(xlsx?|ods|csv)$/)) return 'excel'
  if (lower.match(/\.(zip|rar|7z|tar|gz)$/)) return 'zip'
  if (lower.match(/\.(png|jpe?g|gif|webp|svg|avif)$/)) return 'image'
  if (lower.match(/\.(mp4|webm|mov|avi|mkv)$/)) return 'video'
  if (lower.match(/\.(mp3|wav|ogg|flac|aac)$/)) return 'audio'
  if (url.startsWith('http') || url.startsWith('//')) return 'external'
  return 'internal'
}

const FILE_CONFIGS: Record<FileType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pdf: {
    label: 'PDF',
    color: '#c0392b',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5c-.3 0-.5-.2-.5-.5v-1h-.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5H8v-1c0-.3.2-.5.5-.5s.5.2.5.5v1h1c.3 0 .5.2.5.5s-.2.5-.5.5h-1v1c0 .3-.2.5-.5.5zm4.5-.3c0 .2-.1.3-.3.3H11c-.2 0-.3-.1-.3-.3v-4.4c0-.2.1-.3.3-.3h1.7c.8 0 1.3.6 1.3 1.4v1.9c0 .8-.5 1.4-1.3 1.4zm3.5-3.7c.3 0 .5.2.5.5s-.2.5-.5.5H16v1.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V14c0-.3.2-.5.5-.5h1zm-4 .5h-.5v2.5H13c.2 0 .3-.2.3-.4v-1.7c0-.2-.1-.4-.3-.4z"/>
      </svg>
    ),
  },
  word: {
    label: 'DOC',
    color: '#1a56db',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9.5 17l-2-6h1l1.5 4.5L11.5 11h1l-2 6H9.5z"/>
      </svg>
    ),
  },
  excel: {
    label: 'XLS',
    color: '#057a55',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9 17l2-3-2-3h1.3l1.2 2 1.2-2H14l-2 3 2 3h-1.3L11.5 15l-1.2 2H9z"/>
      </svg>
    ),
  },
  zip: {
    label: 'ZIP',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zm-2 4.5h2v1h-2V8zm2 1h-2v1h2V9zm-2 1h2v1h-2v-1zm2 1h-2v1h2v-1zm-2 1h2v1h-2v-1zm3 5h-4v-2h4v2z"/>
      </svg>
    ),
  },
  image: {
    label: 'IMG',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
      </svg>
    ),
  },
  video: {
    label: 'VIDEO',
    color: '#b45309',
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  audio: {
    label: 'AUDIO',
    color: '#0e7490',
    bg: '#ecfeff',
    border: '#a5f3fc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  external: {
    label: '',
    color: '#034F98',
    bg: 'transparent',
    border: 'transparent',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
  },
  internal: {
    label: '',
    color: '#034F98',
    bg: 'transparent',
    border: 'transparent',
    icon: null,
  },
}

function SmartLink({ url, children, newTab }: { url: string; children: React.ReactNode; newTab?: boolean }) {
  const fileType = detectFileType(url)
  const config = FILE_CONFIGS[fileType]
  const isFile = !['external', 'internal'].includes(fileType)
  const openNewTab = newTab ?? (fileType === 'external' || isFile)

  if (isFile) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={fileType !== 'pdf' && fileType !== 'video' && fileType !== 'audio' ? true : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px 5px 8px',
          borderRadius: '6px',
          border: `1px solid ${config.border}`,
          background: config.bg,
          color: config.color,
          fontSize: '0.8125rem',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'opacity 0.15s, transform 0.15s',
          verticalAlign: 'middle',
          lineHeight: 1.4,
        }}
        className="rt-file-link"
      >
        {config.icon}
        <span>{children}</span>
        {config.label && (
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            padding: '1px 5px',
            borderRadius: '3px',
            background: config.color,
            color: '#fff',
            lineHeight: 1.5,
          }}>{config.label}</span>
        )}
        {/* Download/Open icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '12px', height: '12px', opacity: 0.6, flexShrink: 0 }}>
          {fileType === 'pdf' || fileType === 'video' || fileType === 'audio'
            ? <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>
            : <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
          }
        </svg>
      </a>
    )
  }

  return (
    <a
      href={url}
      className="text-[#034F98] hover:text-[#023874] underline inline-flex items-center gap-1"
      target={fileType === 'external' ? '_blank' : undefined}
      rel={fileType === 'external' ? 'noopener noreferrer' : undefined}
    >
      {children}
      {fileType === 'external' && config.icon}
    </a>
  )
}

type LexicalRoot = {
  root: {
    children: LexicalNode[]
    direction?: string
    format?: string
    indent?: number
    type: string
    version: number
  }
}

function serializeText(node: LexicalNode): string {
  if (!node.text) return ''
  return node.text
}

function NodeRenderer({ node }: { node: LexicalNode }): React.ReactNode {
  if (node.type === 'text') {
    let text: React.ReactNode = node.text || ''
    if (node.format) {
      if (node.format & 1) text = <strong>{text}</strong>  // Bold
      if (node.format & 2) text = <em>{text}</em>          // Italic
      if (node.format & 8) text = <u>{text}</u>            // Underline
      if (node.format & 16) text = <s>{text}</s>           // Strikethrough
      if (node.format & 32) text = <code className="bg-gray-100 px-1 rounded text-sm">{text}</code> // Code
    }
    return <span>{text}</span>
  }

  if (node.type === 'linebreak') return <br />

  const children = node.children?.map((child, i) => (
    <NodeRenderer key={i} node={child} />
  ))

  switch (node.type) {
    case 'paragraph':
      return <p className="mb-4 leading-relaxed">{children}</p>

    case 'heading':
      const tag = node.tag || 'h2'
      const headingClasses: Record<string, string> = {
        h1: 'text-3xl font-bold text-[#10242b] mb-4 mt-8',
        h2: 'text-2xl font-bold text-[#10242b] mb-3 mt-6',
        h3: 'text-xl font-bold text-[#10242b] mb-3 mt-5',
        h4: 'text-lg font-bold text-[#10242b] mb-2 mt-4',
      }
      type HTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const HeadingTag = tag as HTag
      return <HeadingTag className={headingClasses[tag] || headingClasses.h2}>{children}</HeadingTag>

    case 'list':
      if (node.tag === 'ol') return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
      return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>

    case 'listitem':
      return <li className="text-gray-700">{children}</li>

    case 'quote':
      return (
        <blockquote className="border-l-4 border-[#034F98] pl-4 py-1 italic text-gray-600 my-4">
          {children}
        </blockquote>
      )

    case 'upload': {
      // Payload Lexical image/upload node
      const media = typeof node.value === 'object' ? node.value : null
      if (!media?.url) return null
      const isImage = media.mimeType?.startsWith('image/') ?? /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(media.url)
      if (isImage) {
        return (
          <figure className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.url}
              alt={media.alt || ''}
              width={media.width || undefined}
              height={media.height || undefined}
              className="max-w-full rounded-lg"
              loading="lazy"
            />
            {/* {media.alt && (
              <figcaption className="text-xs text-gray-400 mt-2 text-center">{media.alt}</figcaption>
            )} */}
          </figure>
        )
      }
      // Non-image file — render as a download link
      return <SmartLink url={media.url}>{media.filename || media.url}</SmartLink>
    }

    case 'horizontalrule':
      return <hr className="my-6 border-gray-200" />

    case 'link': {
      let resolvedUrl = node.url || node.fields?.url || '#'
      // Payload v3 internal link: fields.doc references a media/collection item
      if (node.fields?.linkType === 'internal' && node.fields?.doc) {
        const docVal = node.fields.doc.value
        if (typeof docVal === 'object' && docVal.url) {
          resolvedUrl = docVal.url
        } else if (typeof docVal === 'object' && docVal.filename) {
          resolvedUrl = `/media/${docVal.filename}`
        }
        // If doc.value is still a number (not populated), URL stays '#' — needs server-side population
      }
      return <SmartLink url={resolvedUrl} newTab={node.fields?.newTab}>{children}</SmartLink>
    }

    default:
      return <>{children}</>
  }
}

interface Props {
  data: LexicalRoot | null | undefined
}

export default function RichText({ data }: Props) {
  if (!data?.root?.children) return null

  return (
    <div className="rich-text">
      {data.root.children.map((node, i) => (
        <NodeRenderer key={i} node={node} />
      ))}
    </div>
  )
}
