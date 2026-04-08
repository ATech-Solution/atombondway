import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'zh'] as const,

  // Default locale (shown without prefix: /about instead of /en/about)
  defaultLocale: 'en',

  // /en/about → redirect to /about (strip default locale prefix)
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
