# Backup & Restore Plugin — Changelog

## v2.0.0 — 2026-04-30

### Title: Full UI Redesign + Google Drive + Project Backup

**New features:**
- Added **project files backup** — creates a tar.gz of all source code, excluding `.next`, `node_modules`, `backups`, `.git`, `data`, and log files
- Added **Google Drive storage** via OAuth2 (personal account, refresh token flow)
- Added **backup scope selection** — choose any combination of DB, Media, and Project
- Added **storage destination selection** — Local and/or Google Drive per backup run
- Added **delete action** — remove backups from local disk or Google Drive with confirmation
- Added **upload zone** — import .db, .tar.gz, or .zip files into the correct backup folder
- Added **Restore Guide** — expandable step-by-step restore instructions inside the admin panel
- Added `/api/plugins/backup/delete` endpoint (DELETE)
- Added `/api/plugins/backup/upload` endpoint (POST)
- Added `/api/plugins/backup/gdrive` endpoint — OAuth auth flow, callback, status, and download proxy

**UI changes:**
- Completely redesigned admin panel: three-section layout (Controls, Backup History, Upload)
- Animated progress bar during backup and restore operations
- Per-row inline restore progress bar
- Unified backup history table (local + Google Drive, all types together)
- Type badges (DB / Media / Project), storage icons (💾 / G)
- Toast notifications replacing inline message banners
- Collapsible Restore Guide section

**Backend changes:**
- `handlers/backup.ts` — added `backupProjectFiles()`, `PROJECT_BACKUPS_DIR`, `getBackupDir()`; updated `listBackups()` to include `project`
- `handlers/restore.ts` — added `restoreProjectFiles()` (preserves .env files on restore)
- `handlers/cloud.ts` — added full Google Drive OAuth2 support: upload, list, delete, download stream, OAuth URL builder, token exchange
- `list/route.ts` — merged local + Google Drive backups; added gdrive connection status
- `run/route.ts` — accepts `scope` and `destinations` in request body; supports selective backup + Google Drive upload
- `restore/route.ts` — added `projectFile` support
- `download/route.ts` — added `project` type support

**Documentation:**
- Created `docs/backup-restore.md` (plugin knowledge doc)
- Updated `docs/ai-prompt-plugin-system.md` to reflect v2.0
- Updated `backups/RESTORE.md` with step-by-step restore guide
- Updated `README.md`

---

## v1.0.0 — initial release

**Features:**
- SQLite database backup (file copy to `backups/db/`)
- Media files backup (tar.gz to `backups/files/`)
- Database and media restore with automatic pre-restore snapshot
- S3/Cloudflare R2 cloud upload (optional, via env vars)
- Admin panel view at `/admin/plugins/backup`
- CLI scripts: `npm run backup` / `npm run restore`
- API endpoints: `/api/plugins/backup/list`, `/run`, `/restore`, `/download`
