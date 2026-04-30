import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getBackupDir } from '@/plugins/backup-restore/handlers/backup'
import { deleteGoogleDriveFile } from '@/plugins/backup-restore/handlers/cloud'

function isSafePath(dir: string, fileName: string): boolean {
  const resolved = path.resolve(dir, fileName)
  return resolved.startsWith(path.resolve(dir))
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, storage, driveId } = body as {
      type: 'db' | 'files' | 'project'
      name: string
      storage: 'local' | 'gdrive'
      driveId?: string
    }

    if (!type || !name || !storage) {
      return NextResponse.json({ error: 'Missing required fields: type, name, storage' }, { status: 400 })
    }

    if (storage === 'local') {
      const dir = getBackupDir(type)
      if (!isSafePath(dir, name)) {
        return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 })
      }
      const filePath = path.join(dir, name)
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found.' }, { status: 404 })
      }
      await fs.promises.unlink(filePath)
      return NextResponse.json({ success: true, deleted: name })
    }

    if (storage === 'gdrive') {
      if (!driveId) {
        return NextResponse.json({ error: 'driveId is required for Google Drive deletion.' }, { status: 400 })
      }
      await deleteGoogleDriveFile(driveId)
      return NextResponse.json({ success: true, deleted: name })
    }

    return NextResponse.json({ error: 'Unknown storage type.' }, { status: 400 })
  } catch (err) {
    console.error('[Backup] Delete error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 },
    )
  }
}
