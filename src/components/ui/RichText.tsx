/**
 * Renders Payload CMS Lexical rich text output using the official WYSIWYG editor.
 */

'use client'

import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

interface Props {
  data: any
}

export default function RichText({ data }: Props) {
  return <LexicalRichText data={data} />
}
