import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  getGoogleOAuthUrl,
  exchangeCodeForTokens,
  isGoogleDriveConfigured,
  isGoogleDriveConnected,
  getGoogleDriveDownloadStream,
} from '@/plugins/backup-restore/handlers/cloud'

// GET /api/plugins/backup/gdrive?action=auth|callback|status|download
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // ─── Status ───────────────────────────────────────────────────────────────
    if (action === 'status' || !action) {
      return NextResponse.json({
        configured: isGoogleDriveConfigured(),
        connected: isGoogleDriveConnected(),
      })
    }

    // ─── Start OAuth flow ─────────────────────────────────────────────────────
    if (action === 'auth') {
      const origin = new URL(request.url).origin
      const redirectUri = `${origin}/api/plugins/backup/gdrive?action=callback`
      try {
        const url = getGoogleOAuthUrl(redirectUri)
        return NextResponse.redirect(url)
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'OAuth setup failed' },
          { status: 500 },
        )
      }
    }

    // ─── OAuth callback ───────────────────────────────────────────────────────
    if (action === 'callback') {
      const code = searchParams.get('code')
      if (!code) {
        return new NextResponse(
          `<html><body><h2>Google Drive Connection Failed</h2><p>No authorization code received.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } },
        )
      }

      const origin = new URL(request.url).origin
      const redirectUri = `${origin}/api/plugins/backup/gdrive?action=callback`

      try {
        const { refreshToken } = await exchangeCodeForTokens(code, redirectUri)
        return new NextResponse(
          `<!DOCTYPE html>
<html>
<head><title>Google Drive Connected</title></head>
<body style="font-family:system-ui;max-width:600px;margin:4rem auto;padding:2rem">
  <h2 style="color:#16a34a">✅ Google Drive Connected!</h2>
  <p>Add this refresh token to your <code>.env</code> file:</p>
  <pre style="background:#f3f4f6;padding:1rem;border-radius:8px;word-break:break-all;font-size:0.85rem">GOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}</pre>
  <p style="color:#6b7280;font-size:0.875rem">After adding the env variable, restart your server and return to the admin panel.</p>
  <a href="/admin/plugins/backup" style="color:#034F98">← Back to Backup &amp; Restore</a>
</body>
</html>`,
          { headers: { 'Content-Type': 'text/html' } },
        )
      } catch (err) {
        return new NextResponse(
          `<html><body><h2>Connection Failed</h2><p>${err instanceof Error ? err.message : 'Unknown error'}</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } },
        )
      }
    }

    // ─── Download proxy ───────────────────────────────────────────────────────
    if (action === 'download') {
      const fileId = searchParams.get('id')
      const fileName = searchParams.get('name') || 'backup'
      if (!fileId) {
        return NextResponse.json({ error: 'Missing file id' }, { status: 400 })
      }

      const stream = await getGoogleDriveDownloadStream(fileId)
      const { Readable } = await import('stream')

      return new NextResponse(stream as unknown as ReadableStream, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/octet-stream',
        },
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[Backup] GDrive route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Google Drive error' },
      { status: 500 },
    )
  }
}
