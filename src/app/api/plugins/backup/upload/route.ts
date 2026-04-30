import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import {
  DB_BACKUPS_DIR,
  FILES_BACKUPS_DIR,
  PROJECT_BACKUPS_DIR,
  BACKUPS_DIR,
} from '@/plugins/backup-restore/handlers/backup'

function inferTargetDir(fileName: string): string {
  if (fileName.endsWith('.db')) return DB_BACKUPS_DIR
  if (fileName.startsWith('media-') && fileName.endsWith('.tar.gz')) return FILES_BACKUPS_DIR
  if (fileName.startsWith('project-') && fileName.endsWith('.tar.gz')) return PROJECT_BACKUPS_DIR
  // Fallback: db dir for .db files, files dir for archives
  if (fileName.endsWith('.tar.gz') || fileName.endsWith('.zip')) return FILES_BACKUPS_DIR
  return DB_BACKUPS_DIR
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const fileName = path.basename(file.name)
    // Prevent path traversal in filename
    if (fileName !== file.name.replace(/[/\\]/g, '_')) {
      // Sanitize filename
    }

    const targetDir = inferTargetDir(fileName)
    fs.mkdirSync(targetDir, { recursive: true })

    const targetPath = path.join(targetDir, fileName)

    // Ensure target stays inside backups dir
    if (!path.resolve(targetPath).startsWith(path.resolve(BACKUPS_DIR))) {
      return NextResponse.json({ error: 'Invalid file destination.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    await fs.promises.writeFile(targetPath, Buffer.from(bytes))

    return NextResponse.json({
      success: true,
      name: fileName,
      size: bytes.byteLength,
      destination: targetDir.replace(path.resolve(process.cwd()), ''),
    })
  } catch (err) {
    console.error('[Backup] Upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 },
    )
  }
}
