'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useTransition } from 'react'

export default function LocaleSwitcher() {
  const locale   = useLocale()
  const pathname = usePathname()
  const router   = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchTo = (next: string) => {
    startTransition(() => { router.replace(pathname, { locale: next }) })
  }

  return (
    <div className="flex items-center text-sm">
      <button
        onClick={() => switchTo('zh')}
        disabled={isPending}
        className={`px-2 py-1 transition-colors ${locale === 'zh' ? 'text-[#034F98] font-semibold' : 'text-[#212529] hover:text-[#034F98]'}`}
      >
        中
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchTo('en')}
        disabled={isPending}
        className={`px-2 py-1 transition-colors ${locale === 'en' ? 'text-[#034F98] font-semibold' : 'text-[#212529] hover:text-[#034F98]'}`}
      >
        EN
      </button>
    </div>
  )
}
