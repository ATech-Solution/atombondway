import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Re-export locale-aware navigation utilities.
// Use these instead of next/navigation in frontend components.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
