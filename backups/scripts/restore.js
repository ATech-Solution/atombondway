#!/usr/bin/env node
/**
 * CLI Restore Script (interactive) — run with: node backups/scripts/restore.js
 * Also available as: npm run restore
 *
 * Lists available backups and prompts which ones to restore.
 * Saves a pre-restore snapshot before overwriting anything.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import readline from 'readline'
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

function resolveDbPath() {
  const url = process.env.DATABASE_URL || ''
  if (url.startsWith('file:')) return path.resolve(url.slice(5))
  if (url && !url.startsWith('http')) return path.resolve(url)
  return path.join(PROJECT_ROOT, 'data', 'payload.db')
}

function resolveMediaDir() {
  return process.env.PAYLOAD_MEDIA_DIR || path.join(PROJECT_ROOT, 'public', 'media')
}

function listDir(dir, ext) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.startsWith('.'))
    .sort()
    .reverse()
}

function isoTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function pickFromList(label, items) {
  if (items.length === 0) {
    console.log(`  No ${label} backups found. Skipping.`)
    return null
  }
  console.log(`\n  Available ${label} backups:`)
  items.forEach((name, i) => {
    const filePath = path.join(label === 'database' ? DB_BACKUPS_DIR : FILES_BACKUPS_DIR, name)
    const stat = fs.statSync(filePath)
    const size =
      stat.size < 1024 * 1024
        ? `${(stat.size / 1024).toFixed(1)} KB`
        : `${(stat.size / 1024 / 1024).toFixed(2)} MB`
    console.log(`    [${i + 1}] ${name}  (${size})`)
  })
  console.log('    [0] Skip')

  const answer = await ask(`\n  Select ${label} backup to restore [0-${items.length}]: `)
  const idx = parseInt(answer, 10)
  if (isNaN(idx) || idx < 0 || idx > items.length) {
    console.log('  Invalid selection, skipping.')
    return null
  }
  if (idx === 0) return null
  return items[idx - 1]
}

async function restoreDatabase(backupName) {
  const backupPath = path.join(DB_BACKUPS_DIR, backupName)
  const dbPath = resolveDbPath()
  const dbDir = path.dirname(dbPath)
  fs.mkdirSync(dbDir, { recursive: true })

  if (fs.existsSync(dbPath)) {
    const snapshot = path.join(DB_BACKUPS_DIR, `pre-restore-${isoTimestamp()}.db`)
    fs.copyFileSync(dbPath, snapshot)
    console.log(`  Pre-restore snapshot saved: ${path.basename(snapshot)}`)
  }

  fs.copyFileSync(backupPath, dbPath)
  console.log(`  ✓ Database restored from: ${backupName}`)
}

async function restoreFiles(backupName) {
  const backupPath = path.join(FILES_BACKUPS_DIR, backupName)
  const mediaDir = resolveMediaDir()
  const parentDir = path.dirname(mediaDir)
  fs.mkdirSync(mediaDir, { recursive: true })
  execSync(`tar -xzf "${backupPath}" -C "${parentDir}"`, { stdio: 'pipe' })
  console.log(`  ✓ Media files restored from: ${backupName}`)
}

async function main() {
  console.log('\n♻️  Atombondway Restore Script')
  console.log('━'.repeat(40))
  console.log('\n  ⚠  WARNING: Restore will overwrite existing data.')
  console.log('     A pre-restore snapshot is saved automatically.\n')

  const dbBackups = listDir(DB_BACKUPS_DIR, '.db').filter(
    (f) => !f.startsWith('pre-restore-'),
  )
  const fileBackups = listDir(FILES_BACKUPS_DIR, '.tar.gz')

  const selectedDb = await pickFromList('database', dbBackups)
  const selectedFiles = await pickFromList('media files', fileBackups)

  if (!selectedDb && !selectedFiles) {
    console.log('\n  Nothing to restore. Exiting.\n')
    rl.close()
    return
  }

  console.log('\n  You are about to restore:')
  if (selectedDb) console.log(`    Database → ${selectedDb}`)
  if (selectedFiles) console.log(`    Media files → ${selectedFiles}`)

  const confirm = await ask('\n  Confirm restore? (yes/no): ')
  if (confirm.trim().toLowerCase() !== 'yes') {
    console.log('\n  Restore cancelled.\n')
    rl.close()
    return
  }

  console.log()
  try {
    if (selectedDb) await restoreDatabase(selectedDb)
    if (selectedFiles) await restoreFiles(selectedFiles)

    console.log('\n  ✅ Restore complete!')
    console.log('  Run `npm run migrate` to verify the database schema.')
    console.log('  Then restart the server: pm2 restart ecosystem.config.js\n')
  } catch (err) {
    console.error('\n  ❌ Restore failed:', err.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
