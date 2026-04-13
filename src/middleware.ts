import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // Maintenance mode — redirect every public request to /maintenance.
  // Admin panel and API remain fully accessible.
  if (process.env.MAINTENANCE_MODE === 'true') {
    if (!request.nextUrl.pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  // Match all frontend routes, but exclude:
  // - /admin        (Payload admin panel)
  // - /api          (Payload REST API + Next.js route handlers)
  // - /_next        (Next.js internals)
  // - /media        (Uploaded media files)
  // - /maintenance  (Under-construction page — always reachable)
  // - Static files with extensions
  matcher: [
    '/((?!admin|api|_next/static|_next/image|media|images|maintenance|favicon.ico|robots.txt|sitemap.xml|\\..*).+)',
    '/',
  ],
}
