'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  name: string
  href: string
}

export function PluginNavLinksClient({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <div className="nav__group">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav__link"
            prefetch={false}
          >
            {isActive && <div className="nav__link-indicator" />}
            <span className="nav__link-label">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
