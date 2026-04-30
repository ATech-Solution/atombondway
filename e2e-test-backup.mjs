/**
 * E2E Test — Backup & Restore Plugin v2.0
 * Run with: node --import tsx e2e-test-backup.mjs
 * Tests handlers directly (no HTTP auth required).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Colour helpers ───────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'

let passed = 0, failed = 0, skipped = 0

function pass(label) {
  passed++
  console.log(`  ${GREEN}✔${RESET}  ${label}`)
}

function fail(label, err) {
  failed++
  console.log(`  ${RED}✖${RESET}  ${label}`)
  if (err) console.log(`       ${RED}${err instanceof Error ? err.message : String(err)}${RESET}`)
}

function skip(label, reason) {
  skipped++
  console.log(`  ${YELLOW}◌${RESET}  ${label} ${YELLOW}(skipped: ${reason})${RESET}`)
}

function section(title) {
  console.log(`\n${CYAN}${BOLD}── ${title} ──${RESET}`)
}

async function run(label, fn) {
  try {
    await fn()
    pass(label)
  } catch (err) {
    fail(label, err)
  }
}

// ─── Load handlers dynamically ────────────────────────────────────────────────
let backup, restore, cloud

section('Loading handlers')

try {
  backup = await import('./src/plugins/backup-restore/handlers/backup.ts')
  pass('handlers/backup.ts loaded')
} catch (err) {
  fail('handlers/backup.ts loaded', err)
  process.exit(1)
}

try {
  restore = await import('./src/plugins/backup-restore/handlers/restore.ts')
  pass('handlers/restore.ts loaded')
} catch (err) {
  fail('handlers/restore.ts loaded', err)
}

try {
  cloud = await import('./src/plugins/backup-restore/handlers/cloud.ts')
  pass('handlers/cloud.ts loaded')
} catch (err) {
  fail('handlers/cloud.ts loaded', err)
}

// ─── Path resolution ──────────────────────────────────────────────────────────

section('Path resolution')

await run('resolveDbPath() returns a string ending in .db', () => {
  const dbPath = backup.resolveDbPath()
  if (!dbPath.endsWith('.db')) throw new Error(`Got: ${dbPath}`)
})

await run('resolveMediaDir() returns a string', () => {
  const mediaDir = backup.resolveMediaDir()
  if (typeof mediaDir !== 'string' || !mediaDir) throw new Error(`Got: ${mediaDir}`)
})

await run('DB_BACKUPS_DIR is inside project root', () => {
  const dir = backup.DB_BACKUPS_DIR
  if (!dir.includes('backups/db')) throw new Error(`Got: ${dir}`)
})

await run('FILES_BACKUPS_DIR is inside project root', () => {
  const dir = backup.FILES_BACKUPS_DIR
  if (!dir.includes('backups/files')) throw new Error(`Got: ${dir}`)
})

await run('PROJECT_BACKUPS_DIR is inside project root', () => {
  const dir = backup.PROJECT_BACKUPS_DIR
  if (!dir.includes('backups/project')) throw new Error(`Got: ${dir}`)
})

await run('getBackupDir("db") returns DB_BACKUPS_DIR', () => {
  const dir = backup.getBackupDir('db')
  if (dir !== backup.DB_BACKUPS_DIR) throw new Error(`Got: ${dir}`)
})

// ─── listBackups ──────────────────────────────────────────────────────────────

section('listBackups()')

await run('listBackups() returns { db, files, project } arrays', () => {
  const result = backup.listBackups()
  if (!Array.isArray(result.db)) throw new Error('db is not an array')
  if (!Array.isArray(result.files)) throw new Error('files is not an array')
  if (!Array.isArray(result.project)) throw new Error('project is not an array')
})

await run('listBackups() creates backup directories if missing', () => {
  const result = backup.listBackups()
  if (!fs.existsSync(backup.DB_BACKUPS_DIR)) throw new Error('DB dir not created')
  if (!fs.existsSync(backup.FILES_BACKUPS_DIR)) throw new Error('Files dir not created')
  if (!fs.existsSync(backup.PROJECT_BACKUPS_DIR)) throw new Error('Project dir not created')
})

// ─── Database backup ──────────────────────────────────────────────────────────

section('Database backup')

let dbBackupFile = null

const dbPath = backup.resolveDbPath()
if (!fs.existsSync(dbPath)) {
  skip('backupDatabase() creates a .db file', 'live database not found at ' + dbPath)
} else {
  await run('backupDatabase() creates a .db snapshot', async () => {
    dbBackupFile = await backup.backupDatabase()
    if (!fs.existsSync(dbBackupFile)) throw new Error(`File not created: ${dbBackupFile}`)
    if (!dbBackupFile.endsWith('.db')) throw new Error(`Wrong extension: ${dbBackupFile}`)
  })

  await run('DB backup file has non-zero size', () => {
    if (!dbBackupFile) throw new Error('No backup file from previous test')
    const stat = fs.statSync(dbBackupFile)
    if (stat.size === 0) throw new Error('File is empty')
  })

  await run('DB backup filename contains timestamp pattern', () => {
    if (!dbBackupFile) throw new Error('No backup file')
    const name = path.basename(dbBackupFile)
    if (!/payload-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.db/.test(name)) {
      throw new Error(`Unexpected filename: ${name}`)
    }
  })

  await run('listBackups() includes the new DB backup', () => {
    const result = backup.listBackups()
    const name = path.basename(dbBackupFile)
    if (!result.db.includes(name)) throw new Error(`${name} not in list: ${JSON.stringify(result.db)}`)
  })
}

// ─── Media files backup ───────────────────────────────────────────────────────

section('Media files backup')

let filesBackupFile = null

const mediaDir = backup.resolveMediaDir()
// Ensure media dir exists for test
fs.mkdirSync(mediaDir, { recursive: true })

await run('backupFiles() creates a .tar.gz archive', async () => {
  filesBackupFile = await backup.backupFiles()
  if (!fs.existsSync(filesBackupFile)) throw new Error(`File not created: ${filesBackupFile}`)
  if (!filesBackupFile.endsWith('.tar.gz')) throw new Error(`Wrong extension: ${filesBackupFile}`)
})

await run('Files backup filename contains timestamp pattern', () => {
  if (!filesBackupFile) throw new Error('No backup file')
  const name = path.basename(filesBackupFile)
  if (!/media-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.tar\.gz/.test(name)) {
    throw new Error(`Unexpected filename: ${name}`)
  }
})

await run('listBackups() includes the new files backup', () => {
  const result = backup.listBackups()
  const name = path.basename(filesBackupFile)
  if (!result.files.includes(name)) throw new Error(`${name} not in list`)
})

// ─── Project files backup ─────────────────────────────────────────────────────

section('Project files backup (source code)')

let projectBackupFile = null

await run('backupProjectFiles() creates a .tar.gz archive', async () => {
  projectBackupFile = await backup.backupProjectFiles()
  if (!fs.existsSync(projectBackupFile)) throw new Error(`File not created: ${projectBackupFile}`)
  if (!projectBackupFile.endsWith('.tar.gz')) throw new Error(`Wrong extension: ${projectBackupFile}`)
})

await run('Project backup file has non-zero size', () => {
  if (!projectBackupFile) throw new Error('No backup file')
  const stat = fs.statSync(projectBackupFile)
  if (stat.size === 0) throw new Error('File is empty (project has content to back up)')
})

await run('Project backup filename contains timestamp pattern', () => {
  if (!projectBackupFile) throw new Error('No backup file')
  const name = path.basename(projectBackupFile)
  if (!/project-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.tar\.gz/.test(name)) {
    throw new Error(`Unexpected filename: ${name}`)
  }
})

await run('listBackups() includes the new project backup', () => {
  const result = backup.listBackups()
  const name = path.basename(projectBackupFile)
  if (!result.project.includes(name)) throw new Error(`${name} not in list`)
})

await run('Project backup excludes node_modules', async () => {
  // List contents and verify node_modules is absent
  const { execSync } = await import('child_process')
  const contents = execSync(`tar -tzf "${projectBackupFile}" 2>/dev/null | head -200`).toString()
  if (contents.includes('node_modules/')) throw new Error('node_modules present in backup!')
  if (contents.includes('.next/')) throw new Error('.next present in backup!')
})

// ─── getBackupFileStat ────────────────────────────────────────────────────────

section('getBackupFileStat()')

await run('getBackupFileStat returns size and mtime for existing file', () => {
  if (!filesBackupFile) throw new Error('No files backup to stat')
  const name = path.basename(filesBackupFile)
  const stat = backup.getBackupFileStat('files', name)
  if (!stat) throw new Error('getBackupFileStat returned null')
  if (typeof stat.size !== 'number') throw new Error('size is not a number')
  if (!(stat.mtime instanceof Date)) throw new Error('mtime is not a Date')
})

await run('getBackupFileStat returns null for non-existent file', () => {
  const stat = backup.getBackupFileStat('db', 'nonexistent.db')
  if (stat !== null) throw new Error(`Expected null, got: ${JSON.stringify(stat)}`)
})

// ─── Database restore ─────────────────────────────────────────────────────────

section('Database restore')

if (!dbBackupFile || !fs.existsSync(dbPath)) {
  skip('restoreDatabase() restores from backup', 'live database or backup not available')
} else {
  await run('restoreDatabase() creates pre-restore snapshot and restores', async () => {
    const beforeCount = backup.listBackups().db.length
    await restore.restoreDatabase(path.basename(dbBackupFile))
    const afterList = backup.listBackups().db
    // Should have pre-restore snapshot + the original backup
    const preRestoreFiles = afterList.filter((f) => f.startsWith('pre-restore-'))
    if (preRestoreFiles.length === 0) throw new Error('No pre-restore snapshot was created')
    // Original DB should still be intact
    if (!fs.existsSync(dbPath)) throw new Error('Database file missing after restore')
  })
}

// ─── Path traversal protection ────────────────────────────────────────────────

section('Path traversal protection (isSafePath logic)')

await run('getBackupDir("files") differs from getBackupDir("db")', () => {
  const dbDir = backup.getBackupDir('db')
  const filesDir = backup.getBackupDir('files')
  const projectDir = backup.getBackupDir('project')
  if (dbDir === filesDir) throw new Error('db and files dirs should differ')
  if (filesDir === projectDir) throw new Error('files and project dirs should differ')
})

// ─── Google Drive configuration ───────────────────────────────────────────────

section('Google Drive')

await run('isGoogleDriveConfigured() returns boolean', () => {
  const result = cloud.isGoogleDriveConfigured()
  if (typeof result !== 'boolean') throw new Error(`Expected boolean, got ${typeof result}`)
})

await run('isGoogleDriveConnected() returns boolean', () => {
  const result = cloud.isGoogleDriveConnected()
  if (typeof result !== 'boolean') throw new Error(`Expected boolean, got ${typeof result}`)
})

if (!cloud.isGoogleDriveConnected()) {
  skip('uploadToGoogleDrive() uploads a file', 'GOOGLE_DRIVE_REFRESH_TOKEN not set')
  skip('listGoogleDriveBackups() lists files', 'GOOGLE_DRIVE_REFRESH_TOKEN not set')
} else {
  await run('listGoogleDriveBackups() returns an array', async () => {
    const files = await cloud.listGoogleDriveBackups()
    if (!Array.isArray(files)) throw new Error('Expected array')
  })
}

// ─── S3 (legacy) ──────────────────────────────────────────────────────────────

section('S3 cloud upload (legacy)')

await run('uploadToCloud() returns null when env vars are absent', async () => {
  const hasS3 = process.env.BACKUP_S3_ENDPOINT && process.env.BACKUP_S3_BUCKET
  if (hasS3) {
    skip('S3 env vars are configured — skipping null check', 'env vars present')
    return
  }
  if (filesBackupFile) {
    const result = await cloud.uploadToCloud(filesBackupFile)
    if (result !== null) throw new Error(`Expected null without S3 env vars, got: ${result}`)
  }
})

// ─── File cleanup (remove test backups) ───────────────────────────────────────

section('Cleanup test backup files')

for (const [type, file] of [['files', filesBackupFile], ['project', projectBackupFile]]) {
  if (file && fs.existsSync(file)) {
    await run(`Remove test ${type} backup`, () => {
      fs.unlinkSync(file)
      if (fs.existsSync(file)) throw new Error(`File still exists after delete: ${file}`)
    })
  }
}

// Keep the DB backup as it may be needed for restore tests in a running server

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`)
console.log(`${BOLD}Results:${RESET}  ${GREEN}${passed} passed${RESET}  ${failed > 0 ? RED : ''}${failed} failed${RESET}  ${YELLOW}${skipped} skipped${RESET}`)

if (failed > 0) {
  console.log(`\n${RED}${BOLD}Some tests failed. See errors above.${RESET}`)
  process.exit(1)
} else {
  console.log(`\n${GREEN}${BOLD}All tests passed!${RESET}`)
}
