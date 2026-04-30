import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import {
  DB_BACKUPS_DIR,
  FILES_BACKUPS_DIR,
  PROJECT_BACKUPS_DIR,
} from '@/plugins/backup-restore/handlers/backup'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'db' | 'files' | 'project' | null
    const fileName = searchParams.get('file')

    if (!type || !fileName || !['db', 'files', 'project'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid parameters. Requires type=db|files|project&file=<name>' },
        { status: 400 },
      )
    }

    const dir =
      type === 'db' ? DB_BACKUPS_DIR : type === 'files' ? FILES_BACKUPS_DIR : PROJECT_BACKUPS_DIR

    // Path traversal protection
    const resolved = path.resolve(dir, fileName)
    if (!resolved.startsWith(path.resolve(dir))) {
      return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 })
    }

    if (!fs.existsSync(resolved)) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(resolved)
    const baseName = path.basename(resolved)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${baseName}"`,
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch (err) {
    console.error('[Backup] Download error:', err)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
