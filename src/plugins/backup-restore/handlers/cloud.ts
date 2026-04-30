import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

// ─── S3 / Cloudflare R2 ────────────────────────────────────────────────────

export async function uploadToCloud(filePath: string): Promise<string | null> {
  const endpoint = process.env.BACKUP_S3_ENDPOINT
  const bucket = process.env.BACKUP_S3_BUCKET
  const accessKeyId = process.env.BACKUP_S3_KEY
  const secretAccessKey = process.env.BACKUP_S3_SECRET
  const region = process.env.BACKUP_S3_REGION || 'us-east-1'

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })

    const fileName = path.basename(filePath)
    const fileContent = fs.readFileSync(filePath)
    const key = `backups/${fileName}`

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
      }),
    )

    return `${endpoint}/${bucket}/${key}`
  } catch (err) {
    console.error('[Backup] Cloud upload failed:', err instanceof Error ? err.message : String(err))
    return null
  }
}

// ─── Google Drive OAuth2 ───────────────────────────────────────────────────

function getGoogleDriveCredentials() {
  return {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  }
}

export function isGoogleDriveConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleDriveCredentials()
  return !!(clientId && clientSecret)
}

export function isGoogleDriveConnected(): boolean {
  const { clientId, clientSecret, refreshToken } = getGoogleDriveCredentials()
  return !!(clientId && clientSecret && refreshToken)
}

async function getAuthClient() {
  const { google } = await import('googleapis')
  const { clientId, clientSecret, refreshToken } = getGoogleDriveCredentials()
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Drive is not connected. Add GOOGLE_DRIVE_REFRESH_TOKEN to your .env.')
  }
  const auth = new google.auth.OAuth2(clientId, clientSecret)
  auth.setCredentials({ refresh_token: refreshToken })
  return auth
}

export type DriveFile = {
  id: string
  name: string
  size: number
  createdTime: string
  webViewLink: string
}

export async function uploadToGoogleDrive(
  filePath: string,
): Promise<{ id: string; webViewLink: string } | null> {
  if (!isGoogleDriveConnected()) return null

  try {
    const { google } = await import('googleapis')
    const auth = await getAuthClient()
    const drive = google.drive({ version: 'v3', auth })
    const { folderId } = getGoogleDriveCredentials()

    const fileName = path.basename(filePath)
    const fileStream = fs.createReadStream(filePath)

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        body: fileStream,
      },
      fields: 'id,webViewLink',
    })

    return {
      id: response.data.id!,
      webViewLink: response.data.webViewLink!,
    }
  } catch (err) {
    console.error(
      '[Backup] Google Drive upload failed:',
      err instanceof Error ? err.message : String(err),
    )
    return null
  }
}

export async function listGoogleDriveBackups(): Promise<DriveFile[]> {
  if (!isGoogleDriveConnected()) return []

  try {
    const { google } = await import('googleapis')
    const auth = await getAuthClient()
    const drive = google.drive({ version: 'v3', auth })
    const { folderId } = getGoogleDriveCredentials()

    const q = folderId ? `'${folderId}' in parents and trashed = false` : 'trashed = false'

    const response = await drive.files.list({
      q,
      fields: 'files(id,name,size,createdTime,webViewLink)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    })

    return (response.data.files || []).map((f) => ({
      id: f.id!,
      name: f.name!,
      size: parseInt(f.size || '0', 10),
      createdTime: f.createdTime!,
      webViewLink: f.webViewLink!,
    }))
  } catch (err) {
    console.error(
      '[Backup] Google Drive list failed:',
      err instanceof Error ? err.message : String(err),
    )
    return []
  }
}

export async function deleteGoogleDriveFile(fileId: string): Promise<void> {
  const { google } = await import('googleapis')
  const auth = await getAuthClient()
  const drive = google.drive({ version: 'v3', auth })
  await drive.files.delete({ fileId })
}

export async function getGoogleDriveDownloadStream(fileId: string): Promise<Readable> {
  const { google } = await import('googleapis')
  const auth = await getAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' },
  )

  return response.data as Readable
}

export function getGoogleOAuthUrl(redirectUri: string): string {
  const { clientId, clientSecret } = getGoogleDriveCredentials()
  if (!clientId || !clientSecret) throw new Error('GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET are required.')

  // Build OAuth URL manually to avoid dynamic import at top level
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<{ refreshToken: string; accessToken: string }> {
  const { clientId, clientSecret } = getGoogleDriveCredentials()
  if (!clientId || !clientSecret) throw new Error('Google Drive client credentials are not set.')

  const { google } = await import('googleapis')
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  const { tokens } = await auth.getToken(code)

  if (!tokens.refresh_token) {
    throw new Error(
      'No refresh token returned. Make sure you prompted for consent and revoked any prior access.',
    )
  }

  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token!,
  }
}
