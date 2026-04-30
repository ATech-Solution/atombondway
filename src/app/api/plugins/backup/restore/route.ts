import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import path from 'path'
import {
  restoreDatabase,
  restoreFiles,
  restoreProjectFiles,
} from '@/plugins/backup-restore/handlers/restore'
import {
  DB_BACKUPS_DIR,
  FILES_BACKUPS_DIR,
  PROJECT_BACKUPS_DIR,
} from '@/plugins/backup-restore/handlers/backup'

function isSafePath(dir: string, fileName: string): boolean {
  const resolved = path.resolve(dir, fileName)
  return resolved.startsWith(path.resolve(dir))
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dbFile, filesFile, projectFile } = body as {
      dbFile?: string
      filesFile?: string
      projectFile?: string
    }

    if (!dbFile && !filesFile && !projectFile) {
      return NextResponse.json(
        { error: 'Provide at least one of: dbFile, filesFile, projectFile' },
        { status: 400 },
      )
    }

    if (dbFile && !isSafePath(DB_BACKUPS_DIR, dbFile)) {
      return NextResponse.json({ error: 'Invalid dbFile path.' }, { status: 400 })
    }
    if (filesFile && !isSafePath(FILES_BACKUPS_DIR, filesFile)) {
      return NextResponse.json({ error: 'Invalid filesFile path.' }, { status: 400 })
    }
    if (projectFile && !isSafePath(PROJECT_BACKUPS_DIR, projectFile)) {
      return NextResponse.json({ error: 'Invalid projectFile path.' }, { status: 400 })
    }

    const restored: string[] = []

    if (dbFile) {
      await restoreDatabase(dbFile)
      restored.push(`database (${dbFile})`)
    }
    if (filesFile) {
      await restoreFiles(filesFile)
      restored.push(`media files (${filesFile})`)
    }
    if (projectFile) {
      await restoreProjectFiles(projectFile)
      restored.push(`project files (${projectFile})`)
    }

    return NextResponse.json({ success: true, restored })
  } catch (err) {
    console.error('[Backup] Restore error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Restore failed' },
      { status: 500 },
    )
  }
}
