import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { backupDatabase, backupFiles } from '@/plugins/backup-restore/handlers/backup'
import { uploadToCloud } from '@/plugins/backup-restore/handlers/cloud'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check plugin is active
    const result = await payload.find({
      collection: 'plugins',
      where: { slug: { equals: 'backup-restore' } },
      limit: 1,
    })
    const plugin = result.docs[0] as { status?: string } | undefined
    if (!plugin || plugin.status !== 'active') {
      return NextResponse.json(
        { error: 'Backup plugin is not active. Enable it in the Plugins collection first.' },
        { status: 403 },
      )
    }

    const [dbFile, filesFile] = await Promise.all([backupDatabase(), backupFiles()])

    // Attempt cloud upload (no-op if env vars not set)
    const [dbCloud, filesCloud] = await Promise.all([
      uploadToCloud(dbFile),
      uploadToCloud(filesFile),
    ])

    return NextResponse.json({
      success: true,
      dbFile,
      filesFile,
      cloudUrls: { db: dbCloud, files: filesCloud },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Backup] Run error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Backup failed' },
      { status: 500 },
    )
  }
}
