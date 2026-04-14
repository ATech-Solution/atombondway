import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

const locales = ['en', 'zh']

/** Revalidate every locale route so stale ISR pages are flushed immediately.
 *  Also busts the layout unstable_cache so header/footer/nav update instantly.
 *  Uses dynamic import so Payload CLI (which uses require()) doesn't choke on
 *  next/cache being an ESM module with top-level await. */
async function purgeAll(): Promise<void> {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    revalidateTag('layout-globals')
    for (const locale of locales) {
      revalidatePath(`/${locale}`, 'layout')
    }
    revalidatePath('/', 'layout')
  } catch {
    // Not running in Next.js context (e.g. Payload CLI) — skip revalidation
  }
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
