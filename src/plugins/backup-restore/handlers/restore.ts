import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import {
  DB_BACKUPS_DIR,
  FILES_BACKUPS_DIR,
  PROJECT_BACKUPS_DIR,
  resolveDbPath,
  resolveMediaDir,
} from './backup.ts'

const PROJECT_ROOT = path.resolve(process.cwd())

export async function restoreDatabase(backupFileName: string): Promise<void> {
  const backupPath = path.join(DB_BACKUPS_DIR, backupFileName)
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Database backup not found: ${backupFileName}`)
  }

  const dbPath = resolveDbPath()
  const dbDir = path.dirname(dbPath)
  fs.mkdirSync(dbDir, { recursive: true })

  // Save a pre-restore snapshot so the restore is reversible
  if (fs.existsSync(dbPath)) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
    const snapshotPath = path.join(DB_BACKUPS_DIR, `pre-restore-${ts}.db`)
    await fs.promises.copyFile(dbPath, snapshotPath)
  }

  await fs.promises.copyFile(backupPath, dbPath)
}

export async function restoreFiles(backupFileName: string): Promise<void> {
  const backupPath = path.join(FILES_BACKUPS_DIR, backupFileName)
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Files backup not found: ${backupFileName}`)
  }

  const mediaDir = resolveMediaDir()
  const parentDir = path.dirname(mediaDir)
  fs.mkdirSync(mediaDir, { recursive: true })

  execSync(`tar -xzf "${backupPath}" -C "${parentDir}"`, { stdio: 'pipe' })
}

// Restore project source files. Deliberately skips .env* files to preserve current secrets.
export async function restoreProjectFiles(backupFileName: string): Promise<void> {
  const backupPath = path.join(PROJECT_BACKUPS_DIR, backupFileName)
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Project backup not found: ${backupFileName}`)
  }

  // Extract to project root, skipping .env files to preserve current environment config
  execSync(
    `tar -xzf "${backupPath}" -C "${PROJECT_ROOT}" --exclude=".env*" --exclude="*.env"`,
    { stdio: 'pipe' },
  )
}
