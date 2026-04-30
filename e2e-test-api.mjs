/**
 * E2E API Test — Backup & Restore Plugin v2.0
 * Uses Payload local API to get auth token, then tests all HTTP endpoints.
 * Run with: NODE_OPTIONS='--import tsx' node --env-file=.env e2e-test-api.mjs
 */

import fs from 'fs'
import path from 'path'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000'

// ─── Colour helpers ───────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'

let passed = 0, failed = 0, skipped = 0

function pass(label, detail = '') {
  passed++
  console.log(`  ${GREEN}✔${RESET}  ${label}${detail ? `  ${YELLOW}${detail}${RESET}` : ''}`)
}
function fail(label, err) {
  failed++
  console.log(`  ${RED}✖${RESET}  ${label}`)
  if (err) console.log(`     ${RED}↳ ${err instanceof Error ? err.message : String(err)}${RESET}`)
}
function skip(label, reason) {
  skipped++
  console.log(`  ${YELLOW}◌${RESET}  ${label} ${YELLOW}(${reason})${RESET}`)
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

// ─── Get auth token: create temp test user, login via HTTP, cleanup ──────────

section('Authentication')

const TEST_EMAIL = `e2e-test-${Date.now()}@payload-test.internal`
const TEST_PASSWORD = 'E2eTestPass!2024'
let token = null
let adminEmail = TEST_EMAIL
let testUserId = null
let payloadForCleanup = null

try {
  const { getPayload } = await import('payload')
  // buildConfig is async and tsx wraps CJS exports with an extra .default layer
  const configMod = await import('./payload.config.ts')
  const configOrPromise = configMod.default?.default ?? configMod.default
  const config = await configOrPromise
  const payload = await getPayload({ config })
  payloadForCleanup = payload

  // Create a temporary admin user with known credentials
  const created = await payload.create({
    collection: 'users',
    data: {
      name: 'E2E Test Admin',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: 'admin',
      _verified: true,
    },
    overrideAccess: true,
  })
  testUserId = created.id

  // Release DB so the running server can use it
  await payload.db?.destroy?.()
  payloadForCleanup = null

  // Get a real JWT via HTTP login (same as Payload admin UI does)
  const loginRes = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  })
  const loginBody = await loginRes.json()
  if (loginRes.status !== 200 || !loginBody.token) {
    throw new Error(`Login failed ${loginRes.status}: ${JSON.stringify(loginBody)}`)
  }
  token = loginBody.token

  pass(`Temp admin created and logged in (${TEST_EMAIL})`)
} catch (err) {
  fail('Create temp admin + login', err)
  console.log(`\n${YELLOW}Cannot test API endpoints without a valid token.${RESET}`)
  process.exit(1)
}

// ─── Helper: authenticated fetch ─────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `JWT ${token}`,
      ...(options.headers || {}),
    },
  })
  let body
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return { status: res.status, body }
}

// ─── Server connectivity ──────────────────────────────────────────────────────

section('Server connectivity')

await run('Server is reachable at ' + BASE, async () => {
  const res = await fetch(`${BASE}/api/users/me`, {
    headers: { Authorization: `JWT ${token}` }
  }).catch(err => { throw new Error(`Cannot connect to ${BASE}: ${err.message}`) })
  if (!res.ok && res.status !== 401) throw new Error(`Unexpected status: ${res.status}`)
})

// ─── Unauthenticated access ───────────────────────────────────────────────────

section('Auth guards (unauthenticated should return 401)')

for (const [method, path] of [
  ['GET', '/api/plugins/backup/list'],
  ['POST', '/api/plugins/backup/run'],
  ['GET', '/api/plugins/backup/download?type=db&file=x'],
  ['DELETE', '/api/plugins/backup/delete'],
]) {
  await run(`${method} ${path} → 401 without token`, async () => {
    const res = await fetch(`${BASE}${path}`, { method })
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`)
  })
}

// ─── GET /api/plugins/backup/list ────────────────────────────────────────────

section('GET /api/plugins/backup/list')

let listData = null

await run('Returns 200 with valid token', async () => {
  const { status, body } = await apiFetch('/api/plugins/backup/list')
  if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
  listData = body
})

await run('Response has pluginStatus field', () => {
  if (!listData) throw new Error('No list data')
  if (!('pluginStatus' in listData)) throw new Error('Missing pluginStatus')
})

await run('Response has gdrive.configured field', () => {
  if (!listData?.gdrive) throw new Error('Missing gdrive field')
  if (typeof listData.gdrive.configured !== 'boolean') throw new Error('gdrive.configured not boolean')
  if (typeof listData.gdrive.connected !== 'boolean') throw new Error('gdrive.connected not boolean')
})

await run('Response has backups array', () => {
  if (!Array.isArray(listData?.backups)) throw new Error('backups is not an array')
})

await run('Each backup entry has required fields', () => {
  for (const entry of (listData?.backups || [])) {
    for (const field of ['name', 'type', 'size', 'mtime', 'storage']) {
      if (!(field in entry)) throw new Error(`Backup entry missing field: ${field}`)
    }
  }
})

// ─── GET /api/plugins/backup/gdrive?action=status ────────────────────────────

section('GET /api/plugins/backup/gdrive (status)')

await run('Returns 200 with gdrive status', async () => {
  const { status, body } = await apiFetch('/api/plugins/backup/gdrive?action=status')
  if (status !== 200) throw new Error(`Expected 200, got ${status}`)
  if (typeof body?.configured !== 'boolean') throw new Error('configured not boolean')
  if (typeof body?.connected !== 'boolean') throw new Error('connected not boolean')
  pass(`configured=${body.configured}, connected=${body.connected}`)
})

// ─── POST /api/plugins/backup/run ────────────────────────────────────────────

section('POST /api/plugins/backup/run')

const pluginStatus = listData?.pluginStatus

if (pluginStatus !== 'active') {
  skip('Run backup (plugin is not active — set to Active in admin first)', `status=${pluginStatus}`)
} else {
  let runData = null

  await run('DB-only backup scope runs successfully', async () => {
    const { status, body } = await apiFetch('/api/plugins/backup/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: ['db'], destinations: ['local'] }),
    })
    if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
    runData = body
    if (!body.success) throw new Error('success is false')
    if (!body.dbFile) throw new Error('dbFile missing in response')
  })

  await run('Response includes timestamp', () => {
    if (!runData?.timestamp) throw new Error('Missing timestamp')
  })

  await run('Media-only backup scope runs successfully', async () => {
    const { status, body } = await apiFetch('/api/plugins/backup/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: ['files'], destinations: ['local'] }),
    })
    if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
    if (!body.success) throw new Error('success is false')
    if (!body.filesFile) throw new Error('filesFile missing')
  })

  await run('Project backup scope runs successfully', async () => {
    const { status, body } = await apiFetch('/api/plugins/backup/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: ['project'], destinations: ['local'] }),
    })
    if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
    if (!body.success) throw new Error('success is false')
    if (!body.projectFile) throw new Error('projectFile missing')
  })

  await run('Full backup (all scope) runs successfully', async () => {
    const { status, body } = await apiFetch('/api/plugins/backup/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: ['db', 'files', 'project'], destinations: ['local'] }),
    })
    if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
    if (!body.success) throw new Error('success is false')
  })

  // ─── GET /api/plugins/backup/download ──────────────────────────────────────

  section('GET /api/plugins/backup/download')

  // Re-fetch list to get actual backup files
  const { body: freshList } = await apiFetch('/api/plugins/backup/list')
  const dbEntries = (freshList?.backups || []).filter(b => b.type === 'db' && b.storage === 'local')
  const filesEntries = (freshList?.backups || []).filter(b => b.type === 'files' && b.storage === 'local')
  const projectEntries = (freshList?.backups || []).filter(b => b.type === 'project' && b.storage === 'local')

  if (dbEntries.length > 0) {
    await run('Download a db backup returns 200 with attachment header', async () => {
      const fileName = dbEntries[0].name
      const res = await fetch(`${BASE}/api/plugins/backup/download?type=db&file=${encodeURIComponent(fileName)}`, {
        headers: { Authorization: `JWT ${token}` }
      })
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`)
      const cd = res.headers.get('content-disposition')
      if (!cd?.includes('attachment')) throw new Error(`Missing attachment header, got: ${cd}`)
    })
  } else {
    skip('Download db backup', 'no db backups in list')
  }

  await run('Download with invalid type returns 400', async () => {
    const { status } = await apiFetch('/api/plugins/backup/download?type=invalid&file=test.db')
    if (status !== 400) throw new Error(`Expected 400, got ${status}`)
  })

  await run('Download with path traversal returns 400', async () => {
    const { status } = await apiFetch('/api/plugins/backup/download?type=db&file=../../etc/passwd')
    if (status !== 400) throw new Error(`Expected 400, got ${status}`)
  })

  await run('Download non-existent file returns 404', async () => {
    const { status } = await apiFetch('/api/plugins/backup/download?type=db&file=nonexistent-99999.db')
    if (status !== 404) throw new Error(`Expected 404, got ${status}`)
  })

  // ─── DELETE /api/plugins/backup/delete ─────────────────────────────────────

  section('DELETE /api/plugins/backup/delete')

  await run('Delete with missing fields returns 400', async () => {
    const { status } = await apiFetch('/api/plugins/backup/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (status !== 400) throw new Error(`Expected 400, got ${status}`)
  })

  await run('Delete non-existent file returns 404', async () => {
    const { status } = await apiFetch('/api/plugins/backup/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'db', name: 'nonexistent.db', storage: 'local' }),
    })
    if (status !== 404) throw new Error(`Expected 404, got ${status}`)
  })

  // Delete one of the test project backups we created
  if (projectEntries.length > 0) {
    await run('Delete a project backup returns 200', async () => {
      const entry = projectEntries[0]
      const { status, body } = await apiFetch('/api/plugins/backup/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'project', name: entry.name, storage: 'local' }),
      })
      if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
      if (!body.success) throw new Error('success is false')
    })
  }

  // ─── POST /api/plugins/backup/upload ───────────────────────────────────────

  section('POST /api/plugins/backup/upload')

  await run('Upload with no file returns 400', async () => {
    const formData = new FormData()
    const res = await fetch(`${BASE}/api/plugins/backup/upload`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}` },
      body: formData,
    })
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`)
  })

  await run('Upload a valid .db file returns 200', async () => {
    // Use the db backup we just created as the upload file
    const dbEntries2 = (freshList?.backups || []).filter(b => b.type === 'db' && b.storage === 'local')
    if (dbEntries2.length === 0) {
      skip('Upload db file', 'no db backups available to use as test upload')
      return
    }
    const entry = dbEntries2[0]
    const { DB_BACKUPS_DIR } = await import('./src/plugins/backup-restore/handlers/backup.ts')
    const filePath = path.join(DB_BACKUPS_DIR, entry.name)

    if (!fs.existsSync(filePath)) {
      skip('Upload db file', 'backup file not found on disk')
      return
    }

    const fileContent = fs.readFileSync(filePath)
    const blob = new Blob([fileContent], { type: 'application/octet-stream' })
    const formData = new FormData()
    formData.append('file', blob, `upload-test-${entry.name}`)

    const res = await fetch(`${BASE}/api/plugins/backup/upload`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}` },
      body: formData,
    })
    const body = await res.json().catch(() => null)
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(body)}`)
    if (!body.success) throw new Error('success is false')

    // Clean up the uploaded test file
    const { getBackupDir } = await import('./src/plugins/backup-restore/handlers/backup.ts')
    const uploadedPath = path.join(getBackupDir('db'), `upload-test-${entry.name}`)
    if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath)
  })

  // ─── POST /api/plugins/backup/restore (validation only) ───────────────────

  section('POST /api/plugins/backup/restore (validation)')

  await run('Restore with no files returns 400', async () => {
    const { status } = await apiFetch('/api/plugins/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (status !== 400) throw new Error(`Expected 400, got ${status}`)
  })

  await run('Restore with path traversal filename returns 400', async () => {
    const { status } = await apiFetch('/api/plugins/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbFile: '../../etc/passwd' }),
    })
    if (status !== 400) throw new Error(`Expected 400, got ${status}`)
  })
}

// ─── Plugin disabled guard ────────────────────────────────────────────────────

if (pluginStatus !== 'active') {
  section('Plugin inactive guard')

  await run('POST /run returns 403 when plugin is inactive', async () => {
    const { status } = await apiFetch('/api/plugins/backup/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: ['db'] }),
    })
    if (status !== 403) throw new Error(`Expected 403, got ${status}`)
  })
}

// ─── Cleanup: delete the temporary test user ──────────────────────────────────

section('Cleanup')

if (testUserId) {
  try {
    const { getPayload } = await import('payload')
    const configMod = await import('./payload.config.ts')
    const configOrPromise = configMod.default?.default ?? configMod.default
    const config = await configOrPromise
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'users', id: testUserId, overrideAccess: true })
    await payload.db?.destroy?.()
    pass(`Temp test user deleted (${TEST_EMAIL})`)
  } catch (err) {
    fail('Delete temp test user', err)
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`)
console.log(`${BOLD}Results:${RESET}  ${GREEN}${passed} passed${RESET}  ${failed > 0 ? RED : ''}${failed} failed${RESET}  ${YELLOW}${skipped} skipped${RESET}`)

if (failed > 0) {
  console.log(`\n${RED}${BOLD}Some tests failed.${RESET}`)
  process.exit(1)
} else {
  console.log(`\n${GREEN}${BOLD}All API tests passed!${RESET}`)
}
