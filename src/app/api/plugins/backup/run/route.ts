import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { backupDatabase, backupFiles, backupProjectFiles } from '@/plugins/backup-restore/handlers/backup'
import { uploadToCloud, uploadToGoogleDrive } from '@/plugins/backup-restore/handlers/cloud'

type Scope = 'db' | 'files' | 'project'
type Destination = 'local' | 'gdrive'

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

    let body: { scope?: Scope[]; destinations?: Destination[] } = {}
    try {
      body = await request.json()
    } catch {
      // No body — use defaults
    }

    const scope: Scope[] = body.scope?.length ? body.scope : ['db', 'files', 'project']
    const destinations: Destination[] = body.destinations?.length ? body.destinations : ['local']

    // Run all selected backup types in parallel
    const [dbFile, filesFile, projectFile] = await Promise.all([
      scope.includes('db') ? backupDatabase() : Promise.resolve(null),
      scope.includes('files') ? backupFiles() : Promise.resolve(null),
      scope.includes('project') ? backupProjectFiles() : Promise.resolve(null),
    ])

    const cloudUrls: Record<string, string | null> = {}
    const driveUrls: Record<string, { id: string; webViewLink: string } | null> = {}

    // Cloud uploads (S3 — legacy, runs if env vars set)
    if (destinations.includes('local')) {
      const uploads = await Promise.all([
        dbFile ? uploadToCloud(dbFile) : null,
        filesFile ? uploadToCloud(filesFile) : null,
        projectFile ? uploadToCloud(projectFile) : null,
      ])
      if (dbFile) cloudUrls.db = uploads[0]
      if (filesFile) cloudUrls.files = uploads[1]
      if (projectFile) cloudUrls.project = uploads[2]
    }

    // Google Drive uploads
    if (destinations.includes('gdrive')) {
      const driveUploads = await Promise.all([
        dbFile ? uploadToGoogleDrive(dbFile) : null,
        filesFile ? uploadToGoogleDrive(filesFile) : null,
        projectFile ? uploadToGoogleDrive(projectFile) : null,
      ])
      if (dbFile) driveUrls.db = driveUploads[0]
      if (filesFile) driveUrls.files = driveUploads[1]
      if (projectFile) driveUrls.project = driveUploads[2]
    }

    return NextResponse.json({
      success: true,
      dbFile: dbFile ? dbFile.split('/').pop() : null,
      filesFile: filesFile ? filesFile.split('/').pop() : null,
      projectFile: projectFile ? projectFile.split('/').pop() : null,
      cloudUrls,
      driveUrls,
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
