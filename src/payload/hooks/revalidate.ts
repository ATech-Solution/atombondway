import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

const locales = ['en', 'zh']

/** Revalidate every locale route so stale ISR pages are flushed immediately. */
function purgeAll(): void {
  for (const locale of locales) {
    revalidatePath(`/${locale}`, 'layout')
  }
  // Also revalidate the root in case there's a redirect/root layout
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
