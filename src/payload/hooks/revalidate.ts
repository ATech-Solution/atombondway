import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

const locales = ['en', 'zh']

/** Revalidate every locale route so stale ISR pages are flushed immediately.
 *  Also busts the layout unstable_cache so header/footer/nav update instantly. */
function purgeAll(): void {
  // Bust the layout globals cache (navigation, footer, custom CSS, site settings)
  revalidateTag('layout-globals')

  for (const locale of locales) {
    revalidatePath(`/${locale}`, 'layout')
  }
  revalidatePath('/', 'layout')
}

export const revalidateOnChange: CollectionAfterChangeHook = () => {
  purgeAll()
}

export const revalidateOnDelete: CollectionAfterDeleteHook = () => {
  purgeAll()
}

export const revalidateGlobalOnChange: GlobalAfterChangeHook = () => {
  purgeAll()
}
