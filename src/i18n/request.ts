import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Validate locale — fall back to default if invalid
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: locale === 'zh'
      ? (await import('../../messages/zh.json')).default
      : (await import('../../messages/en.json')).default,
  }
})
