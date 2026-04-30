#!/usr/bin/env node
/**
 * CLI Backup Script — run with: node backups/scripts/backup.js
 * Also available as: npm run backup
 *
 * Backs up the SQLite database and media files to backups/db/ and backups/files/.
 * Optionally uploads to S3/R2 if BACKUP_S3_* env vars are set.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'backups')
const DB_BACKUPS_DIR = path.join(BACKUPS_DIR, 'db')
const FILES_BACKUPS_DIR = path.join(BACKUPS_DIR, 'files')

// Load .env if present
try {
  const envPath = path.join(PROJECT_ROOT, '.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
} catch {}

function isoTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
}

function resolveDbPath() {
  const url = process.env.DATABASE_URL || ''
  if (url.startsWith('file:')) return path.resolve(url.slice(5))
  if (url && !url.startsWith('http')) return path.resolve(url)
  return path.join(PROJECT_ROOT, 'data', 'payload.db')
}

function resolveMediaDir() {
  return process.env.PAYLOAD_MEDIA_DIR || path.join(PROJECT_ROOT, 'public', 'media')
}

function ensureDirs() {
  fs.mkdirSync(DB_BACKUPS_DIR, { recursive: true })
  fs.mkdirSync(FILES_BACKUPS_DIR, { recursive: true })
}

async function backupDatabase() {
  const dbPath = resolveDbPath()
  if (!fs.existsSync(dbPath)) throw new Error(`Database not found: ${dbPath}`)
  const dest = path.join(DB_BACKUPS_DIR, `payload-${isoTimestamp()}.db`)
  fs.copyFileSync(dbPath, dest)
  return dest
}

async function backupFiles() {
  const mediaDir = resolveMediaDir()
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true })
  }
  const dest = path.join(FILES_BACKUPS_DIR, `media-${isoTimestamp()}.tar.gz`)
  execSync(`tar -czf "${dest}" -C "${path.dirname(mediaDir)}" "${path.basename(mediaDir)}"`, {
    stdio: 'pipe',
  })
  return dest
}

async function uploadToCloud(filePath) {
  const endpoint = process.env.BACKUP_S3_ENDPOINT
  const bucket = process.env.BACKUP_S3_BUCKET
  const accessKeyId = process.env.BACKUP_S3_KEY
  const secretAccessKey = process.env.BACKUP_S3_SECRET
  const region = process.env.BACKUP_S3_REGION || 'us-east-1'

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      endpoint, region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })
    const fileName = path.basename(filePath)
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: `backups/${fileName}`,
      Body: fs.readFileSync(filePath),
    }))
    return `${endpoint}/${bucket}/backups/${fileName}`
  } catch (err) {
    console.error('  Cloud upload failed:', err.message)
    return null
  }
}

async function main() {
  console.log('\n🗄  Atombondway Backup Script')
  console.log('━'.repeat(40))
  ensureDirs()

  try {
    process.stdout.write('  Backing up database... ')
    const dbFile = await backupDatabase()
    const dbStat = fs.statSync(dbFile)
    console.log(`✓ ${path.basename(dbFile)} (${(dbStat.size / 1024).toFixed(1)} KB)`)

    process.stdout.write('  Backing up media files... ')
    const filesFile = await backupFiles()
    const filesStat = fs.statSync(filesFile)
    console.log(`✓ ${path.basename(filesFile)} (${(filesStat.size / 1024 / 1024).toFixed(2)} MB)`)

    const cloudEndpoint = process.env.BACKUP_S3_ENDPOINT
    if (cloudEndpoint) {
      process.stdout.write('  Uploading to cloud... ')
      const [dbCloud, filesCloud] = await Promise.all([uploadToCloud(dbFile), uploadToCloud(filesFile)])
      if (dbCloud || filesCloud) {
        console.log('✓ uploaded')
        if (dbCloud) console.log(`    DB:    ${dbCloud}`)
        if (filesCloud) console.log(`    Files: ${filesCloud}`)
      }
    }

    console.log('\n✅ Backup complete!\n')
  } catch (err) {
    console.error('\n❌ Backup failed:', err.message)
    process.exit(1)
  }
}

main()
