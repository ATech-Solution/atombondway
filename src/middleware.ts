import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all frontend routes, but exclude:
  // - /admin       (Payload admin panel)
  // - /api         (Payload REST API + Next.js route handlers)
  // - /_next       (Next.js internals)
  // - /media       (Uploaded media files)
  // - Static files with extensions
  matcher: [
    '/((?!admin|api|_next/static|_next/image|media|images|favicon.ico|robots.txt|sitemap.xml|\\..*).+)',
    '/',
  ],
}
