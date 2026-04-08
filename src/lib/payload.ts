import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Get the Payload CMS client for server-side data fetching.
 * Singleton — reuses the same instance across all requests in the process.
 * Use in Server Components, Route Handlers, and Server Actions only.
 */
let cached: ReturnType<typeof getPayload> | null = null

export const getPayloadClient = async () => {
  if (!cached) cached = getPayload({ config })
  return cached
}
