# AI Prompt — Install Plugin System + Backup & Restore Plugin v2.0

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

I need you to install a **Plugin System + Backup & Restore Plugin v2.0** into my existing Payload CMS 3.x + Next.js 15 project.

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

Fields:
- `name` (text, required) — human-readable plugin name
- `slug` (text, unique, required, readOnly) — identifier used in code
- `description` (textarea)
- `version` (text, default `"1.0.0"`)
- `status` (select: `active` | `inactive`, default `inactive`) — in sidebar
- `config` (json) — plugin-specific settings, including `adminPath` for the sidebar link

Access: admin-only for create/update/delete. Editors can read.
Admin group: `"System"`

---

#### 2. Admin Sidebar Nav — Active Plugin Links

When a plugin is set to Active, it should automatically appear as a nav link in the admin sidebar (below the System group).

Create two files:

**`src/components/admin/PluginNavLinks.tsx`** — async server component:
- Receives `payload` from Payload's server props
- Fetches all active plugins from the Plugins collection
- Renders `PluginNavLinksClient` with plugin items
- Each item's href: `plugin.config?.adminPath` OR `/admin/plugins/{slug}`

**`src/components/admin/PluginNavLinksClient.tsx`** — `'use client'` component:
- Receives `items: { name: string, href: string }[]`
- Uses `usePathname()` from `next/navigation` for active state
- Renders links using Payload's nav CSS classes: `nav__group`, `nav__link`, `nav__link-indicator`, `nav__link-label`
- Import `Link` from `next/link`

Register in `payload.config.ts`:
```typescript
admin: {
  components: {
    afterNavLinks: ['@/components/admin/PluginNavLinks#PluginNavLinks'],
  },
}
```

---

#### 3. Backup & Restore Plugin v2.0

All plugin code in **`src/plugins/backup-restore/`**.
Backup results in a top-level **`backups/`** folder.
Every plugin requires a `CHANGELOG.md` in its folder and a `docs/{slug}.md` knowledge doc.

##### File structure:

```
src/plugins/backup-restore/
├── index.ts
├── BackupView.tsx
├── CHANGELOG.md
├── README.md
└── handlers/
    ├── backup.ts
    ├── restore.ts
    └── cloud.ts

backups/
├── db/
├── files/
├── project/
├── scripts/
│   ├── backup.js
│   └── restore.js
└── RESTORE.md

src/app/api/plugins/backup/
├── run/route.ts
├── restore/route.ts
├── download/route.ts
├── list/route.ts
├── delete/route.ts
├── upload/route.ts
└── gdrive/route.ts

docs/
├── plugins.md
└── backup-restore.md
```

##### `handlers/backup.ts`:
- `backupDatabase()` — copies SQLite DB to `backups/db/payload-{timestamp}.db`
- `backupFiles()` — creates `backups/files/media-{timestamp}.tar.gz` of media directory
- `backupProjectFiles()` — creates `backups/project/project-{timestamp}.tar.gz` of project source, excluding: `.next`, `node_modules`, `backups`, `.git`, `data`, `*.log`, `.DS_Store`, `dist`, `build`, `.cache`
- `listBackups()` — returns `{ db: string[], files: string[], project: string[] }` newest-first
- `resolveDbPath()` — reads `DATABASE_URL` env var (strips `file:` prefix), falls back to `data/payload.db`
- `resolveMediaDir()` — reads `PAYLOAD_MEDIA_DIR` env var, falls back to `public/media`
- Export `DB_BACKUPS_DIR`, `FILES_BACKUPS_DIR`, `PROJECT_BACKUPS_DIR`, `BACKUPS_DIR`, `getBackupDir(type)`

##### `handlers/restore.ts`:
- `restoreDatabase(fileName)` — saves pre-restore snapshot, then copies backup over live DB
- `restoreFiles(fileName)` — extracts tar.gz to parent of media dir
- `restoreProjectFiles(fileName)` — extracts tar.gz to project root, excludes `.env*` files (preserves secrets)

##### `handlers/cloud.ts`:

S3 (legacy, unchanged):
- `uploadToCloud(filePath)` — uploads to S3/R2, returns URL or null

Google Drive (OAuth2):
- `isGoogleDriveConfigured()` — checks if `GOOGLE_DRIVE_CLIENT_ID` + `CLIENT_SECRET` are set
- `isGoogleDriveConnected()` — checks all three: client ID, secret, refresh token
- `uploadToGoogleDrive(filePath)` — uploads file to Drive folder, returns `{ id, webViewLink }` or null
- `listGoogleDriveBackups()` — lists files in Drive folder, returns `DriveFile[]`
- `deleteGoogleDriveFile(fileId)` — deletes file from Drive
- `getGoogleDriveDownloadStream(fileId)` — returns Readable stream for proxying downloads
- `getGoogleOAuthUrl(redirectUri)` — builds OAuth consent URL (no dynamic import needed)
- `exchangeCodeForTokens(code, redirectUri)` — exchanges auth code for `{ refreshToken, accessToken }`

Uses `googleapis` npm package. Env vars: `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID`.

##### API routes — all require `user.role === 'admin'`:

**`list/route.ts`** (GET):
- Returns `{ pluginStatus, gdrive: { configured, connected }, backups: [...] }`
- Backups array: merged local + Google Drive, each entry has `{ name, type, size, mtime, storage, driveId? }`
- Infer type from filename: `.db` → `db`, `media-*.tar.gz` → `files`, `project-*.tar.gz` → `project`

**`run/route.ts`** (POST, body: `{ scope?: ('db'|'files'|'project')[], destinations?: ('local'|'gdrive')[] }`):
- Defaults: all scope, local only
- Run selected handlers in parallel
- Upload to Google Drive if `gdrive` in destinations
- Returns `{ success, dbFile?, filesFile?, projectFile?, cloudUrls, driveUrls, timestamp }`

**`restore/route.ts`** (POST, body: `{ dbFile?, filesFile?, projectFile? }`):
- Path traversal validation for all types
- Returns `{ success, restored: string[] }`

**`download/route.ts`** (GET, `?type=db|files|project&file=<name>`):
- Path traversal protection
- Streams file with `Content-Disposition: attachment`

**`delete/route.ts`** (DELETE, body: `{ type, name, storage, driveId? }`):
- Local: unlinks file from disk
- gdrive: calls `deleteGoogleDriveFile(driveId)`

**`upload/route.ts`** (POST, multipart/form-data, field `file`):
- Detects target subfolder from filename (`.db` → `db/`, `media-*.tar.gz` → `files/`, `project-*.tar.gz` → `project/`)
- Validates destination stays inside `backups/`

**`gdrive/route.ts`** (GET, `?action=auth|callback|status|download`):
- `auth` — redirects to Google OAuth consent URL
- `callback?code=...` — exchanges code, shows HTML page with the refresh token to copy
- `status` — returns `{ configured, connected }`
- `download?id=<driveId>&name=<fileName>` — proxies Drive file download

##### `BackupView.tsx` — `'use client'` React component:

Three-section layout with inline CSS only (no Tailwind):

**Section 1 — Backup Controls:**
- Plugin title + status badge
- Scope checkboxes: `Database (SQLite)`, `Media Files`, `Project Files`
- Destination checkboxes: `Save Locally`, `Google Drive` (disabled if not configured; shows Connect link if configured but no token)
- Run Backup button (disabled when plugin inactive or running)
- Animated indeterminate progress bar while running

**Section 2 — Backup History:**
- Unified table: local + Google Drive, newest first
- Columns: File name (truncated, monospace), Type badge (DB/Media/Project), Date/Time, Storage icon (💾 or G), Size + Download button, Restore button, Delete (🗑) icon
- Restore shows per-row inline progress bar + confirmation dialog
- Delete shows confirmation dialog
- Refresh button

**Section 3 — Upload:**
- Drag-and-drop zone + file picker (accepts .db, .tar.gz, .zip)
- Upload progress bar
- Success/error toast

**Bottom: Restore Guide** (collapsible):
- Step-by-step restore instructions (stop server, restore, migrate, restart, verify, rollback tip)

State management: plugin status, gdrive status, backups array, running/restoring/deleting/uploading states, confirm dialogs, toast messages.

##### `index.ts`:
```typescript
export const PLUGIN_METADATA = {
  slug: 'backup-restore',
  name: 'Backup & Restore',
  description: 'Backup and restore SQLite database, media files, and project source. Supports local storage and Google Drive.',
  version: '2.0.0',
} as const
```

---

#### 4. Modify `payload.config.ts`

Imports:
```typescript
import { Plugins } from './src/payload/collections/Plugins.ts'
import { PLUGIN_METADATA } from './src/plugins/backup-restore/index.ts'
```

Admin components:
```typescript
admin: {
  components: {
    // ...graphics, views...
    afterNavLinks: ['@/components/admin/PluginNavLinks#PluginNavLinks'],
  },
}
```

Seed function:
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
          config: { adminPath: '/admin/plugins/backup' },
        },
      })
    }
  } catch {
    // Silent on first boot
  }
}

onInit: async (payload) => {
  await seedPlugins(payload)
},
```

---

#### 5. Create documentation

**`docs/backup-restore.md`** — plugin knowledge doc:
- Overview, file structure, env vars table, Google Drive setup steps, API reference, backup file naming, project backup exclusions, restore notes, admin panel UI description, portability checklist

**`docs/plugins.md`** — plugin system overview:
- Managing plugins (enable/disable), plugin doc convention (docs/{slug}.md + CHANGELOG.md), available plugins list, creating a new plugin (7 steps), security notes, folder structure

**`src/plugins/backup-restore/CHANGELOG.md`** — version history starting at v1.0.0

**`src/plugins/backup-restore/README.md`** — quick start, env vars table, API table, backup locations

**`backups/RESTORE.md`** — step-by-step server restore guide:
1. Prerequisites
2. Download backup file
3. Stop server (`pm2 stop ecosystem.config.js`)
4. Restore (Option A: admin panel, Option B: CLI `npm run restore`, Option C: manual commands)
5. Verify schema (`npm run migrate`)
6. Reinstall dependencies if project restore
7. Restart server
8. Verify site
9. Rollback instructions (`pre-restore-*.db` location)

---

#### 6. Update `.gitignore`

Add:
```
backups/db/*.db
backups/files/*.tar.gz
backups/project/*.tar.gz
```

Create `.gitkeep` files:
- `backups/db/.gitkeep`
- `backups/files/.gitkeep`
- `backups/project/.gitkeep`

---

#### 7. Update `package.json`

Scripts:
```json
"backup": "node backups/scripts/backup.js",
"restore": "node backups/scripts/restore.js"
```

Dependencies:
```json
"@aws-sdk/client-s3": "^3.0.0",
"googleapis": "^150.0.0"
```

---

### After implementation

```bash
npm install
npm run generate:types
npm run generate:importmap
npm run build
npm run migrate
```

Then:
1. Open `/admin` → **System → Plugins** — Backup & Restore is auto-created as Inactive
2. Set it to **Active** and save
3. The plugin link appears in the sidebar under **Plugins**
4. Click it → `/admin/plugins/backup`
5. For Google Drive: add `GOOGLE_DRIVE_CLIENT_ID` + `GOOGLE_DRIVE_CLIENT_SECRET` to `.env`, restart, then click **Connect →** and follow the OAuth flow

---

### Optional: CLI scripts

Create `backups/scripts/backup.js` and `backups/scripts/restore.js` — plain ESM `.js` files that manually load `.env` and call the same backup/restore logic. These run without building the Next.js app.

---

> End of prompt ↑

---

## Notes for adaptation

| Thing to verify | Why it matters |
|----------------|---------------|
| User `role` field values | API routes check `user.role === 'admin'` |
| `DATABASE_URL` format | `file:` prefix handling in `resolveDbPath()` |
| `PAYLOAD_MEDIA_DIR` or media path | `backupFiles()` tars this directory |
| `@/` alias target | Must point to `src/` |
| Payload config filename | Some projects use `payload.config.ts` at root, others inside `src/` |
| PM2 config name | Restore guide references `ecosystem.config.js` — update if different |
| `@payloadcms/db-sqlite` vs Postgres | If using Postgres, swap DB backup from file-copy to `pg_dump` |
| Google Drive redirect URI | Must match exactly what's registered in Google Cloud Console |

---

## For Postgres projects

Replace `backupDatabase()` in `handlers/backup.ts`:

```typescript
export async function backupDatabase(): Promise<string> {
  const dest = path.join(DB_BACKUPS_DIR, `payload-${isoTimestamp()}.sql.gz`)
  const dbUrl = process.env.DATABASE_URL || ''
  execSync(`pg_dump "${dbUrl}" | gzip > "${dest}"`, { stdio: 'pipe' })
  return dest
}
```

Restore with:
```bash
gunzip -c backup.sql.gz | psql "$DATABASE_URL"
```
