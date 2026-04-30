import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import {
  listBackups,
  DB_BACKUPS_DIR,
  FILES_BACKUPS_DIR,
  PROJECT_BACKUPS_DIR,
} from '@/plugins/backup-restore/handlers/backup'
import {
  listGoogleDriveBackups,
  isGoogleDriveConfigured,
  isGoogleDriveConnected,
} from '@/plugins/backup-restore/handlers/cloud'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db, files, project } = listBackups()

    const toEntries = (dir: string, names: string[], type: 'db' | 'files' | 'project') =>
      names.map((name) => {
        const filePath = path.join(dir, name)
        try {
          const stat = fs.statSync(filePath)
          return {
            name,
            type,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
            storage: 'local' as const,
          }
        } catch {
          return { name, type, size: 0, mtime: '', storage: 'local' as const }
        }
      })

    // Check plugin status
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

    // Merge local backups
    const localBackups = [
      ...toEntries(DB_BACKUPS_DIR, db, 'db'),
      ...toEntries(FILES_BACKUPS_DIR, files, 'files'),
      ...toEntries(PROJECT_BACKUPS_DIR, project, 'project'),
    ].sort((a, b) => (b.mtime > a.mtime ? 1 : -1))

    // Google Drive backups (if connected)
    let driveBackups: {
      name: string
      type: 'db' | 'files' | 'project' | 'unknown'
      size: number
      mtime: string
      storage: 'gdrive'
      driveId: string
      webViewLink: string
    }[] = []

    if (isGoogleDriveConnected()) {
      const driveFiles = await listGoogleDriveBackups()
      driveBackups = driveFiles.map((f) => ({
        name: f.name,
        type: inferTypeFromName(f.name),
        size: f.size,
        mtime: f.createdTime,
        storage: 'gdrive' as const,
        driveId: f.id,
        webViewLink: f.webViewLink,
      }))
    }

    return NextResponse.json({
      pluginStatus,
      gdrive: {
        configured: isGoogleDriveConfigured(),
        connected: isGoogleDriveConnected(),
      },
      backups: [...localBackups, ...driveBackups].sort((a, b) =>
        b.mtime > a.mtime ? 1 : -1,
      ),
    })
  } catch (err) {
    console.error('[Backup] List error:', err)
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 })
  }
}

function inferTypeFromName(name: string): 'db' | 'files' | 'project' | 'unknown' {
  if (name.endsWith('.db') || name.startsWith('payload-') || name.startsWith('pre-restore-'))
    return 'db'
  if (name.startsWith('media-')) return 'files'
  if (name.startsWith('project-')) return 'project'
  return 'unknown'
}
