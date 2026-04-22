import type { ReactNode } from 'react'
import '@payloadcms/next/css'
import '@/styles/admin.scss'

export const metadata = {
  title: 'Reset Password — Atom Bondway',
  robots: { index: false, follow: false },
}

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
