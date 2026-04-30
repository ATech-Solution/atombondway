# AI Prompt — Install Plugin System + Backup & Restore Plugin

Copy and paste the prompt below into any AI assistant (Claude, ChatGPT, etc.) to install this plugin system into a new Payload CMS 3.x + Next.js 15 project.

---

## How to Use This Document

1. Open a new chat with your AI assistant
2. Copy the **FULL PROMPT** section below
3. Paste it into the chat
4. The AI will ask you any project-specific questions before implementing

---

## FULL PROMPT

> Paste everything below this line ↓

---

I need you to install a **Plugin System + Backup & Restore Plugin** into my existing Payload CMS 3.x + Next.js 15 project. 

### Project assumptions (correct me if different)
- Framework: **Next.js 15** with App Router
- CMS: **Payload CMS 3.x** (`payload@3.x`)
- Database: **SQLite** (file at `data/payload.db`, adapter `@payloadcms/db-sqlite`)
- Media: stored at `public/media/` (or `PAYLOAD_MEDIA_DIR` env var)
- TypeScript, `@/` path alias pointing to `src/`
- Payload config at `payload.config.ts` (project root)
- Role-based access: users have a `role` field with values `admin` | `editor`
- Access helpers `isAdmin` and `isAuthenticated` at `src/payload/access/index.ts`

If any of these are different in my project, ask me before proceeding.

---

### What to build

#### 1. Plugins Collection — `src/payload/collections/Plugins.ts`

A Payload CMS collection that acts as a plugin registry. Each plugin is a document.

Fields:
- `name` (text, required) — human-readable plugin name
- `slug` (text, unique, required, readOnly) — identifier used in code
- `description` (textarea)
- `version` (text, default `"1.0.0"`)
- `status` (select: `active` | `inactive`, default `inactive`) — in sidebar
- `config` (json) — plugin-specific settings

Access: admin-only for create/update/delete. Editors can read.
Admin group: `"System"`

---

#### 2. Backup & Restore Plugin

All plugin code goes in **`src/plugins/backup-restore/`**.
Backup result files go in a **separate top-level `backups/` folder** (not inside `src/`).

##### File structure to create:

```
src/plugins/backup-restore/
├── index.ts                    ← exports PLUGIN_METADATA + re-exports handlers
├── BackupView.tsx              ← 'use client' React component for admin panel
└── handlers/
    ├── backup.ts               ← backupDatabase(), backupFiles(), listBackups()
    ├── restore.ts              ← restoreDatabase(), restoreFiles()
    └── cloud.ts                ← uploadToCloud() — optional S3/R2

backups/
├── db/                         ← .db snapshots (gitignored content)
├── files/                      ← .tar.gz archives (gitignored content)
├── scripts/
│   ├── backup.js               ← standalone Node.js CLI (no compile needed)
│   └── restore.js              ← interactive CLI with readline prompts
└── RESTORE.md                  ← step-by-step restore guide

src/app/api/plugins/backup/
├── run/route.ts                ← POST — trigger backup
├── restore/route.ts            ← POST — restore from backup
├── download/route.ts           ← GET  — stream file as download
└── list/route.ts               ← GET  — list backups + plugin status

docs/
└── plugins.md                  ← full plugin system documentation
```

##### `handlers/backup.ts` logic:
- `backupDatabase()`: copies the SQLite `.db` file to `backups/db/payload-{ISO-timestamp}.db`
- `backupFiles()`: runs `tar -czf backups/files/media-{ISO-timestamp}.tar.gz -C public/ media/`
- `listBackups()`: reads `backups/db/` and `backups/files/`, returns sorted arrays (newest first)
- `resolveDbPath()`: reads `DATABASE_URL` env var (strip `file:` prefix), falls back to `./data/payload.db`
- `resolveMediaDir()`: reads `PAYLOAD_MEDIA_DIR` env var, falls back to `./public/media`
- Export constants `DB_BACKUPS_DIR` and `FILES_BACKUPS_DIR` for use in API routes

##### `handlers/restore.ts` logic:
- `restoreDatabase(backupFileName)`: before overwriting, copies current DB to `pre-restore-{ts}.db` snapshot, then `fs.copyFile` the backup over the live DB
- `restoreFiles(backupFileName)`: runs `tar -xzf {backup} -C public/` to extract

##### `handlers/cloud.ts` logic:
- `uploadToCloud(filePath)`: dynamic `import('@aws-sdk/client-s3')`, uses env vars:
  - `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`, `BACKUP_S3_KEY`, `BACKUP_S3_SECRET`, `BACKUP_S3_REGION`
- Returns the cloud URL string on success, `null` if env vars are missing (silent skip)

##### `BackupView.tsx` — custom Payload admin view:
- `'use client'` React component
- Sections: status badge, Run Backup button, DB backup history table, Files backup history table
- Each table row: filename, size (formatted KB/MB), date, Download button, Restore button
- Restore button shows a confirm modal before calling the API
- Calls `/api/plugins/backup/list` on mount to load status + history
- Calls `/api/plugins/backup/run` (POST) on backup button
- Calls `/api/plugins/backup/restore` (POST) on confirm restore
- Download opens `/api/plugins/backup/download?type=db|files&file={name}` in new tab
- Run Backup button is disabled if plugin status is not `active`
- Style: inline CSS only, no Tailwind (admin panel doesn't use Tailwind)

##### API routes — all require `user.role === 'admin'`:
Auth pattern for all routes:
```typescript
const payload = await getPayload({ config })
const { user } = await payload.auth({ headers: request.headers })
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

- `list/route.ts` (GET): reads plugin status from Plugins collection + calls `listBackups()`, returns `{ pluginStatus, backups: { db: [...], files: [...] } }` with size/mtime per file
- `run/route.ts` (POST): checks plugin is active, calls `backupDatabase()` + `backupFiles()` in parallel, calls `uploadToCloud()` for each, returns `{ success, dbFile, filesFile, cloudUrls, timestamp }`
- `restore/route.ts` (POST, body `{ dbFile?, filesFile? }`): validates paths with `path.resolve` to prevent path traversal, calls `restoreDatabase()` and/or `restoreFiles()`
- `download/route.ts` (GET, `?type=db|files&file=<name>`): validates path stays inside `backups/` dir, streams file with `Content-Disposition: attachment`

##### CLI scripts — plain `.js` files, ESM, no build required:
- `backup.js`: loads `.env` manually, calls same backup logic, prints progress with ✓ checkmarks
- `restore.js`: uses `readline` to list backups interactively, asks user to pick DB backup + files backup (or skip each), asks for confirmation, runs restore

---

#### 3. Modify `payload.config.ts`

Add these imports at the top:
```typescript
import { Plugins } from './src/payload/collections/Plugins.ts'
import { PLUGIN_METADATA } from './src/plugins/backup-restore/index.ts'
```

Add `Plugins` to the `collections` array.

Add the admin view to the `admin.components` block:
```typescript
admin: {
  components: {
    // ...existing graphics etc...
    views: {
      BackupRestore: {
        Component: '@/plugins/backup-restore/BackupView#BackupView',
        path: '/plugins/backup',
      },
    },
  },
}
```

Add a `seedPlugins` function (before `buildConfig`) and call it from `onInit`:
```typescript
async function seedPlugins(payload) {
  try {
    const existing = await payload.find({
      collection: 'plugins',
      where: { slug: { equals: PLUGIN_METADATA.slug } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'plugins',
        data: {
          name: PLUGIN_METADATA.name,
          slug: PLUGIN_METADATA.slug,
          description: PLUGIN_METADATA.description,
          version: PLUGIN_METADATA.version,
          status: 'inactive',
        },
      })
    }
  } catch {
    // Silent on first boot before migrations run
  }
}
```

Add `onInit` to the config:
```typescript
onInit: async (payload) => {
  await seedPlugins(payload)
},
```

---

#### 4. Update `.gitignore`

Add to `.gitignore`:
```
backups/db/*.db
backups/files/*.tar.gz
```

Create placeholder files so the empty folders are committed:
- `backups/db/.gitkeep`
- `backups/files/.gitkeep`

---

#### 5. Update `package.json`

Add to `scripts`:
```json
"backup": "node backups/scripts/backup.js",
"restore": "node backups/scripts/restore.js"
```

Add to `dependencies`:
```json
"@aws-sdk/client-s3": "^3.0.0"
```

---

#### 6. Create `backups/RESTORE.md`

A step-by-step restore guide covering:
1. Prerequisites
2. Stop the server (PM2: `pm2 stop ecosystem.config.js`)
3. Run `npm run restore` (interactive) OR manual copy commands
4. Run `npm run migrate` to verify schema
5. Restart server (`pm2 start ecosystem.config.js`)
6. Verification steps (check admin login, check media URLs)
7. Rollback: the `pre-restore-*.db` file location

---

#### 7. Create `docs/plugins.md`

Document covering:
- What the Plugins collection is
- How to enable/disable a plugin in the admin panel
- How to create a new plugin (folder structure, metadata export, admin view registration, API route pattern, seeding)
- Security notes (admin-only guards, path traversal protection)
- Full folder structure reference

---

### After implementation

Run these commands in order:
```bash
npm install
npm run generate:types     # regenerate Payload types to include 'plugins' slug
npm run build              # verify no TypeScript errors
npm run migrate            # create the plugins table in SQLite
```

Then:
1. Open `/admin` → **System → Plugins** — the Backup & Restore plugin will be auto-created as Inactive
2. Set it to **Active**
3. Visit `/admin/plugins/backup` to use the backup panel

---

### Optional cloud upload

Add to `.env` to enable S3/R2 cloud upload after each backup:
```env
BACKUP_S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
BACKUP_S3_BUCKET=my-backups-bucket
BACKUP_S3_KEY=your-access-key-id
BACKUP_S3_SECRET=your-secret-access-key
BACKUP_S3_REGION=auto
```

Cloud upload is silently skipped if these vars are absent.

---

> End of prompt ↑

---

## Notes for adaptation

When pasting into a different project, check:

| Thing to verify | Why it matters |
|----------------|---------------|
| User `role` field values | API routes check `user.role === 'admin'` |
| `DATABASE_URL` format | `file:` prefix handling in `resolveDbPath()` |
| `PAYLOAD_MEDIA_DIR` or media path | `backupFiles()` tars this directory |
| `@/` alias target | Must point to `src/` |
| Payload config filename | Some projects use `payload.config.ts` at root, others inside `src/` |
| PM2 config name | Restore guide references `ecosystem.config.js` — update if different |
| `@payloadcms/db-sqlite` vs Postgres | If using Postgres, swap the DB backup from file-copy to `pg_dump` |

---

## For Postgres projects

If the target project uses PostgreSQL instead of SQLite, replace the `backupDatabase()` logic with:

```typescript
import { execSync } from 'child_process'

export async function backupDatabase(): Promise<string> {
  const dest = path.join(DB_BACKUPS_DIR, `payload-${isoTimestamp()}.sql.gz`)
  const dbUrl = process.env.DATABASE_URL || ''
  execSync(`pg_dump "${dbUrl}" | gzip > "${dest}"`, { stdio: 'pipe' })
  return dest
}
```

And restore with:
```bash
gunzip -c backup.sql.gz | psql "$DATABASE_URL"
```
