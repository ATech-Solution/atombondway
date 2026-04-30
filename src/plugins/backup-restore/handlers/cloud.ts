import fs from 'fs'
import path from 'path'

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
