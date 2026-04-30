import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { listBackups, DB_BACKUPS_DIR, FILES_BACKUPS_DIR } from '@/plugins/backup-restore/handlers/backup'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db, files } = listBackups()

    const toEntries = (dir: string, names: string[]) =>
      names.map((name) => {
        const filePath = path.join(dir, name)
        try {
          const stat = fs.statSync(filePath)
          return { name, size: stat.size, mtime: stat.mtime.toISOString() }
        } catch {
          return { name, size: 0, mtime: '' }
        }
      })

    // Check plugin status from Plugins collection
    let pluginStatus = 'unknown'
    try {
      const result = await payload.find({
        collection: 'plugins',
        where: { slug: { equals: 'backup-restore' } },
        limit: 1,
      })
      if (result.docs.length > 0) {
        pluginStatus = (result.docs[0] as { status?: string }).status ?? 'unknown'
      }
    } catch {
      pluginStatus = 'unknown'
    }

    return NextResponse.json({
      pluginStatus,
      backups: {
        db: toEntries(DB_BACKUPS_DIR, db),
        files: toEntries(FILES_BACKUPS_DIR, files),
      },
    })
  } catch (err) {
    console.error('[Backup] List error:', err)
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 })
  }
}
