import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import '@/app/globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'Under Maintenance — Atom Bondway',
  robots: { index: false, follow: false },
}

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="frontend" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
