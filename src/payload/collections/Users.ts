import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin, isAuthenticated } from '../access/index.ts'

const buildVerifyEmailHTML = (user: User, token: string): string => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/users/verify/${token}`
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Verify your email</title></head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #10242b;">Verify your email address</h1>
        <p>Hello <strong>${user.name || user.email}</strong>,</p>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <a href="${url}"
           style="display: inline-block; background: #034F98; color: white; padding: 12px 28px;
                  border-radius: 9999px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">If you did not create an account, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">If the button does not work, copy and paste this URL:<br/>${url}</p>
      </body>
    </html>
  `
}

const buildResetPasswordEmailHTML = (token: string, serverUrl: string): string => {
  const url = `${serverUrl}/admin/reset-password?token=${token}`
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Reset your password</title></head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #10242b;">Reset your password</h1>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}"
           style="display: inline-block; background: #034F98; color: white; padding: 12px 28px;
                  border-radius: 9999px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, you can ignore this email.</p>
      </body>
    </html>
  `
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // tokenExpiration: 7200, // 2 hours
    // verify: false,
    tokenExpiration: 7200, // 2 hours
    // Only require email verification when AWS SES is configured.
    // Without a real email transport, verification emails can't be sent
    // and users would be permanently locked out.
    verify: process.env.AWS_SES_SMTP_USER
      ? {
          generateEmailHTML: ({ token, user }) =>
            buildVerifyEmailHTML(user as User, token as string),
        }
      : false,
    forgotPassword: {
      generateEmailHTML: (args) =>
        buildResetPasswordEmailHTML((args?.token ?? '') as string, args?.req?.payload?.config?.serverURL ?? ''),
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    description: 'Manage admin and editor accounts.',
  },
  access: {
    read: isAuthenticated,
    create: isAdmin,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length === 0) return 'Full name is required.'
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.'
        if (value.length > 100) return `Full name is too long (${value.length} characters). Keep it under 100 characters.`
        if (/^\d+$/.test(value.trim())) return 'Full name cannot be numbers only. Please enter a real name.'
        return true
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Admins can manage users. Editors can only manage content.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Role is required. Please select Admin or Editor.'
        if (!['admin', 'editor'].includes(value)) return 'Invalid role. Please select Admin or Editor.'
        return true
      },
    },
  ],
}
