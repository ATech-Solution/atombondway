# Backup & Restore Plugin — Knowledge Doc

> **AI note:** This is the primary reference for the Backup & Restore plugin. Always read this before making any changes to the plugin. After any change, update this doc and `CHANGELOG.md`.

**Plugin slug:** `backup-restore`  
**Current version:** 2.0.0  
**Admin panel:** `/admin/plugins/backup`  
**Plugin folder:** `src/plugins/backup-restore/`

---

## Overview

The Backup & Restore plugin creates snapshots of:
- **Database** — copies the SQLite `.db` file
- **Media files** — creates a `.tar.gz` archive of `public/media/`
- **Project files** — creates a `.tar.gz` archive of the project source (excluding build folders)

Backups can be stored **locally** (in the `backups/` folder) and/or uploaded to **Google Drive** via OAuth2.

---

## File Structure

```
src/plugins/backup-restore/
├── index.ts                  ← PLUGIN_METADATA export + public re-exports
├── BackupView.tsx            ← 'use client' admin panel UI
├── CHANGELOG.md              ← version history
├── README.md                 ← quick start guide
└── handlers/
    ├── backup.ts             ← backupDatabase, backupFiles, backupProjectFiles, listBackups
    ├── restore.ts            ← restoreDatabase, restoreFiles, restoreProjectFiles
    └── cloud.ts              ← S3 upload, Google Drive (upload, list, delete, download, OAuth)

backups/
├── db/                       ← .db snapshots (gitignored)
├── files/                    ← media .tar.gz archives (gitignored)
├── project/                  ← project .tar.gz archives (gitignored)
├── scripts/
│   ├── backup.js             ← CLI: npm run backup
│   └── restore.js            ← CLI: npm run restore
└── RESTORE.md                ← step-by-step server restore guide

src/app/api/plugins/backup/
├── run/route.ts              ← POST — trigger backup
├── list/route.ts             ← GET  — list all backups + Google Drive status
├── restore/route.ts          ← POST — restore from backup
├── download/route.ts         ← GET  — download backup file
├── delete/route.ts           ← DELETE — remove backup file
├── upload/route.ts           ← POST — upload backup file
└── gdrive/route.ts           ← GET  — OAuth flow, download proxy
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Optional | SQLite DB path (e.g. `file:./data/payload.db`). Defaults to `data/payload.db` |
| `PAYLOAD_MEDIA_DIR` | Optional | Media directory path. Defaults to `public/media` |
| `BACKUP_S3_ENDPOINT` | Optional | S3/R2 endpoint URL for cloud upload |
| `BACKUP_S3_BUCKET` | Optional | S3/R2 bucket name |
| `BACKUP_S3_KEY` | Optional | S3/R2 access key |
| `BACKUP_S3_SECRET` | Optional | S3/R2 secret key |
| `BACKUP_S3_REGION` | Optional | S3/R2 region (default: `us-east-1`) |
| `GOOGLE_DRIVE_CLIENT_ID` | For Google Drive | OAuth2 client ID from Google Cloud Console |
| `GOOGLE_DRIVE_CLIENT_SECRET` | For Google Drive | OAuth2 client secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | For Google Drive | Obtained via the in-app OAuth flow |
| `GOOGLE_DRIVE_FOLDER_ID` | For Google Drive | Drive folder ID for uploads (optional, defaults to root) |

---

## Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Drive API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `https://your-domain.com/api/plugins/backup/gdrive?action=callback`
   - For local dev: `http://localhost:3000/api/plugins/backup/gdrive?action=callback`
7. Copy the **Client ID** and **Client Secret** to your `.env`:
   ```
   GOOGLE_DRIVE_CLIENT_ID=your-client-id
   GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
   ```
8. Restart the server, then go to **Admin → Backup & Restore**
9. Click **Connect →** next to Google Drive, log in, authorize the app
10. Copy the displayed `GOOGLE_DRIVE_REFRESH_TOKEN` to your `.env`
11. Restart the server — Google Drive is now connected

---

## API Reference

All endpoints require `user.role === 'admin'`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/plugins/backup/list` | List all local + Drive backups, plugin status, gdrive connection |
| `POST` | `/api/plugins/backup/run` | Run backup. Body: `{ scope: ['db','files','project'], destinations: ['local','gdrive'] }` |
| `POST` | `/api/plugins/backup/restore` | Restore. Body: `{ dbFile?, filesFile?, projectFile? }` |
| `GET` | `/api/plugins/backup/download?type=db|files|project&file=<name>` | Download local backup file |
| `DELETE` | `/api/plugins/backup/delete` | Delete backup. Body: `{ type, name, storage, driveId? }` |
| `POST` | `/api/plugins/backup/upload` | Upload backup file (multipart/form-data, field: `file`) |
| `GET` | `/api/plugins/backup/gdrive?action=auth` | Start Google OAuth flow |
| `GET` | `/api/plugins/backup/gdrive?action=callback&code=...` | OAuth callback (handled automatically) |
| `GET` | `/api/plugins/backup/gdrive?action=status` | Check Drive connection status |
| `GET` | `/api/plugins/backup/gdrive?action=download&id=<driveId>&name=<fileName>` | Proxy Drive file download |

---

## Backup File Naming

```
payload-2026-04-30_10-00-00.db             ← database snapshot
pre-restore-2026-04-30_10-05-00.db         ← auto-snapshot before restore
media-2026-04-30_10-00-00.tar.gz           ← media archive
project-2026-04-30_10-00-00.tar.gz         ← project source archive
```

---

## Project Backup: What's Excluded

The project backup excludes:
- `.next/` — Next.js build output
- `node_modules/` — npm packages (install from package.json)
- `backups/` — backup files themselves
- `.git/` — git history
- `data/` — live database (backed up separately)
- `*.log` — log files
- `.DS_Store`, `dist/`, `build/`, `.cache/`

---

## Restore Notes

- **Database restore**: automatically saves `pre-restore-*.db` to `backups/db/` before overwriting.
- **Project restore**: preserves `.env*` files — never overwrites secrets.
- **Media restore**: extracts tar.gz to the parent of `public/media/`.

---

## Admin Panel UI

The admin panel at `/admin/plugins/backup` has three sections:

1. **Backup Controls** — scope checkboxes (DB / Media / Project), destination (Local / Google Drive), Run button, progress bar
2. **Backup History** — unified table of all local and Drive backups with type badge, date, storage icon, download, restore, and delete actions
3. **Upload** — drag-and-drop or file picker for importing existing backup files

---

## Portability Checklist (for other projects)

When installing this plugin in a new Payload CMS project:

| Check | Notes |
|-------|-------|
| User `role` field | API routes check `user.role === 'admin'` |
| `DATABASE_URL` format | `file:` prefix is stripped in `resolveDbPath()` |
| Media path | Set `PAYLOAD_MEDIA_DIR` or ensure media is at `public/media/` |
| `@/` alias | Must point to `src/` |
| `payload.config.ts` location | Must be at project root or adjust import paths |
| Google Drive credentials | Follow the setup steps above |
| PM2 config name | Update `RESTORE.md` if using a different process manager |
| Payload version | Built for Payload CMS 3.x with Next.js 15 App Router |

---

## Changelog

See [CHANGELOG.md](../src/plugins/backup-restore/CHANGELOG.md) for full version history.
