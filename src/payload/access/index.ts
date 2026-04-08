import type { Access } from 'payload'
import type { User } from '@/payload-types'

/**
 * Casts the opaque req.user to the generated User type once,
 * so every access function downstream gets full type safety.
 */
const resolveUser = (user: unknown): User | null =>
  (user as User | null) ?? null

/** Grants access only to authenticated admin-role users. */
export const isAdmin: Access = ({ req }) =>
  resolveUser(req.user)?.role === 'admin'

/** Grants access to any authenticated user, regardless of role. */
export const isAuthenticated: Access = ({ req }) => !!req.user

/** Grants access to everyone (public read). */
export const isPublic: Access = () => true
