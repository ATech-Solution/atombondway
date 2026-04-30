import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import path from 'path'
import { restoreDatabase, restoreFiles } from '@/plugins/backup-restore/handlers/restore'
import { DB_BACKUPS_DIR, FILES_BACKUPS_DIR } from '@/plugins/backup-restore/handlers/backup'

function isSafePath(dir: string, fileName: string): boolean {
  // Prevent path traversal — ensure resolved path stays inside the expected dir
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
    const { dbFile, filesFile } = body as { dbFile?: string; filesFile?: string }

    if (!dbFile && !filesFile) {
      return NextResponse.json({ error: 'Provide dbFile and/or filesFile to restore.' }, { status: 400 })
    }

    // Validate file names don't contain path traversal
    if (dbFile && !isSafePath(DB_BACKUPS_DIR, dbFile)) {
      return NextResponse.json({ error: 'Invalid dbFile path.' }, { status: 400 })
    }
    if (filesFile && !isSafePath(FILES_BACKUPS_DIR, filesFile)) {
      return NextResponse.json({ error: 'Invalid filesFile path.' }, { status: 400 })
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

    return NextResponse.json({ success: true, restored })
  } catch (err) {
    console.error('[Backup] Restore error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Restore failed' },
      { status: 500 },
    )
  }
}
