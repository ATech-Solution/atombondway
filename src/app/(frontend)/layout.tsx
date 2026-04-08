import type { ReactNode } from 'react'
import { getLocale } from 'next-intl/server'
import { Poppins } from 'next/font/google'
import '@/app/globals.css'

/**
 * Root layout for the entire frontend group.
 *
 * Owns the <html> and <body> shell so the Payload admin panel
 * (which has its own shell via Payload's RootLayout) never shares HTML structure
 * with the public-facing site.
 *
 * CSS and fonts are loaded here — they are bundled only for frontend routes
 * and never bleed into the admin panel's separate HTML document.
 */

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export default async function FrontendRootLayout({ children }: { children: ReactNode }) {
  // next-intl middleware sets the locale on every request before this runs.
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="frontend" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
