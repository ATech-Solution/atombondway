import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const PROJECT_ROOT = path.resolve(process.cwd())
export const BACKUPS_DIR = path.join(PROJECT_ROOT, 'backups')
export const DB_BACKUPS_DIR = path.join(BACKUPS_DIR, 'db')
export const FILES_BACKUPS_DIR = path.join(BACKUPS_DIR, 'files')

function ensureDirs() {
  fs.mkdirSync(DB_BACKUPS_DIR, { recursive: true })
  fs.mkdirSync(FILES_BACKUPS_DIR, { recursive: true })
}

function isoTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
}

export function resolveDbPath(): string {
  const url = process.env.DATABASE_URL || ''
  if (url.startsWith('file:')) return path.resolve(url.slice(5))
  if (url && !url.startsWith('http')) return path.resolve(url)
  return path.join(PROJECT_ROOT, 'data', 'payload.db')
}

export function resolveMediaDir(): string {
  return process.env.PAYLOAD_MEDIA_DIR || path.join(PROJECT_ROOT, 'public', 'media')
}

export async function backupDatabase(): Promise<string> {
  ensureDirs()
  const dbPath = resolveDbPath()
  if (!fs.existsSync(dbPath)) throw new Error(`Database file not found: ${dbPath}`)
  const dest = path.join(DB_BACKUPS_DIR, `payload-${isoTimestamp()}.db`)
  await fs.promises.copyFile(dbPath, dest)
  return dest
}

export async function backupFiles(): Promise<string> {
  ensureDirs()
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

export function listBackups(): { db: string[]; files: string[] } {
  ensureDirs()
  const readDir = (dir: string, ext: string) =>
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => f.endsWith(ext) && !f.startsWith('.'))
          .sort()
          .reverse()
      : []
  return {
    db: readDir(DB_BACKUPS_DIR, '.db'),
    files: readDir(FILES_BACKUPS_DIR, '.tar.gz'),
  }
}

export function getBackupFileStat(type: 'db' | 'files', fileName: string) {
  const dir = type === 'db' ? DB_BACKUPS_DIR : FILES_BACKUPS_DIR
  const filePath = path.join(dir, fileName)
  if (!fs.existsSync(filePath)) return null
  const stat = fs.statSync(filePath)
  return { size: stat.size, mtime: stat.mtime }
}
