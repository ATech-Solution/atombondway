# Backup & Restore Plugin

Backs up and restores the SQLite database (`data/payload.db`) and media files (`public/media`).

## Features

- One-click backup from the Payload admin panel
- Download backup files directly from the browser
- Restore database or media files with automatic pre-restore snapshot
- Optional upload to S3-compatible cloud storage (Cloudflare R2, AWS S3, MinIO)
- CLI scripts for server-side use: `npm run backup` / `npm run restore`

## Admin Panel

Go to **Admin → Backup & Restore** (visible when plugin is Active).

The plugin must be set to **Active** in **Admin → System → Plugins** before backups can run.

## Backup Storage

| Location | Path |
|----------|------|
| Database backups | `backups/db/` |
| Media file backups | `backups/files/` |
| Restore guide | `backups/RESTORE.md` |

## CLI Usage

```bash
# Create a backup
npm run backup
# or
node backups/scripts/backup.js

# Interactive restore
npm run restore
# or
node backups/scripts/restore.js
```

## Cloud Upload (Optional)

Add these to your `.env` to enable automatic cloud upload after each backup:

```env
BACKUP_S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
BACKUP_S3_BUCKET=my-backups
BACKUP_S3_KEY=your-access-key-id
BACKUP_S3_SECRET=your-secret-access-key
BACKUP_S3_REGION=auto
```

Cloud upload is silently skipped if any of these vars are absent.

## API Endpoints

All endpoints require an active admin session.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/plugins/backup/list` | List backups + plugin status |
| `POST` | `/api/plugins/backup/run` | Trigger a new backup |
| `POST` | `/api/plugins/backup/restore` | Restore from a backup |
| `GET` | `/api/plugins/backup/download?type=db&file=<name>` | Download a backup file |

## File Naming

```
payload-2025-04-30_10-00-00.db        ← database snapshot
media-2025-04-30_10-00-00.tar.gz      ← media archive
pre-restore-2025-04-30_10-05-00.db    ← auto-snapshot before restore
```
