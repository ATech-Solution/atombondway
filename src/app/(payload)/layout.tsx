'use server'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import { importMap } from './admin/importMap'
import configPromise from '@payload-config'
import React from 'react'
import '@payloadcms/next/css'  // Payload admin UI styles (240KB, required)
import '@/styles/admin.scss'   // Custom brand overrides (loads after, so it wins)
import './custom.css'          // Custom styles for the admin UI (optional)

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config: configPromise, importMap })
}

export default async function PayloadLayout({ children }: Args) {
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}


