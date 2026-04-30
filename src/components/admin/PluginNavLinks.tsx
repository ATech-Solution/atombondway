import React from 'react'
import type { ServerProps } from 'payload'
import { PluginNavLinksClient } from './PluginNavLinksClient'

type PluginDoc = {
  name: string
  slug: string
  status: string
  config?: { adminPath?: string } | null
}

// Server component — runs on the server, fetches active plugins from Payload,
// then hands off to a client component for active-state highlighting.
export async function PluginNavLinks({ payload }: ServerProps) {
  if (!payload) return null

  let items: { name: string; href: string }[] = []

  try {
    const result = await payload.find({
      collection: 'plugins',
      where: { status: { equals: 'active' } },
      limit: 50,
    })

    items = result.docs.map((doc) => {
      const plugin = doc as unknown as PluginDoc
      const adminPath =
        (plugin.config as { adminPath?: string } | null)?.adminPath ||
        `/admin/plugins/${plugin.slug}`
      return { name: plugin.name, href: adminPath }
    })
  } catch {
    // Payload not ready (first boot / migration) — render nothing
    return null
  }

  if (items.length === 0) return null

  return <PluginNavLinksClient items={items} />
}
