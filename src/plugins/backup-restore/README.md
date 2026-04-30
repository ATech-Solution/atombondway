# Backup & Restore Plugin v2.0

Backup and restore the SQLite database, media files, and project source code from the Payload CMS admin panel.

## Features

- One-click backup from the admin panel with scope selection (DB / Media / Project)
- Store backups locally and/or upload to Google Drive (OAuth2)
- Download, restore, and delete backups directly from the admin panel
- Inline restore progress bar and confirmation dialogs
- Upload existing backup files via drag-and-drop
- Collapsible restore guide built into the admin UI
- CLI scripts: `npm run backup` / `npm run restore`
- Optional S3/Cloudflare R2 cloud upload

## Quick Start

1. Plugin is auto-created as **Inactive** on first boot.
2. Go to **Admin → System → Plugins** → set Backup & Restore to **Active**.
3. Visit **Admin → Plugins → Backup & Restore** (the link appears in the sidebar automatically).
4. Select what to back up and where to store it, then click **Run Backup Now**.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_DRIVE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Obtained via in-app OAuth flow |
| `GOOGLE_DRIVE_FOLDER_ID` | Target Drive folder (optional) |
| `BACKUP_S3_ENDPOINT` | S3/R2 endpoint (optional legacy) |
| `BACKUP_S3_BUCKET` | S3/R2 bucket (optional legacy) |
| `BACKUP_S3_KEY` | S3/R2 access key (optional legacy) |
| `BACKUP_S3_SECRET` | S3/R2 secret (optional legacy) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/plugins/backup/list` | List backups + Drive status |
| `POST` | `/api/plugins/backup/run` | Run backup (body: `{scope, destinations}`) |
| `POST` | `/api/plugins/backup/restore` | Restore backup |
| `GET` | `/api/plugins/backup/download` | Download local backup |
| `DELETE` | `/api/plugins/backup/delete` | Delete backup |
| `POST` | `/api/plugins/backup/upload` | Upload backup file |
| `GET` | `/api/plugins/backup/gdrive` | Google Drive OAuth + download proxy |

## Backup Locations

| Type | Local path |
|------|-----------|
| Database | `backups/db/payload-*.db` |
| Media files | `backups/files/media-*.tar.gz` |
| Project source | `backups/project/project-*.tar.gz` |

## Full Documentation

See [`docs/backup-restore.md`](../../../docs/backup-restore.md) for the complete knowledge doc including Google Drive setup, API reference, and portability checklist.
