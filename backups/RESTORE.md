# Restore Guide — Atombondway

This document explains how to restore your database and/or media files from a backup.

---

## Prerequisites

- Node.js v20 or higher installed
- Project cloned and `npm install` completed
- `.env` file present at project root with correct values
- Access to the server (SSH or local)

---

## Quick Restore (Interactive CLI)

The fastest way to restore — runs interactively and guides you through each step:

```bash
node backups/scripts/restore.js
# or
npm run restore
```

The script will:
1. List all available backups
2. Ask which database backup to restore (or skip)
3. Ask which media files backup to restore (or skip)
4. Ask for confirmation before overwriting anything
5. Save a pre-restore snapshot of the current database automatically

---

## Manual Restore Steps

Follow these steps if you prefer to restore manually.

### Step 1 — Stop the server

```bash
pm2 stop ecosystem.config.js
# or if running directly:
# kill the node/next process
```

### Step 2 — Identify your backup files

Database backups are in `backups/db/`:
```bash
ls -lh backups/db/
# payload-2025-04-30_10-00-00.db
```

Media file backups are in `backups/files/`:
```bash
ls -lh backups/files/
# media-2025-04-30_10-00-00.tar.gz
```

### Step 3 — (Safety) Save a pre-restore snapshot

Before overwriting anything, save a snapshot of the current database:

```bash
cp data/payload.db backups/db/pre-restore-manual-$(date +%Y-%m-%d).db
```

### Step 4 — Restore the database

Replace `<backup-file>` with the file you want to restore:

```bash
cp backups/db/<backup-file>.db data/payload.db
```

Example:
```bash
cp backups/db/payload-2025-04-30_10-00-00.db data/payload.db
```

### Step 5 — Restore media files (optional)

Replace `<backup-file>` with the `.tar.gz` you want to restore:

```bash
tar -xzf backups/files/<backup-file>.tar.gz -C public/
```

Example:
```bash
tar -xzf backups/files/media-2025-04-30_10-00-00.tar.gz -C public/
```

> This extracts the `media/` folder back into `public/`, overwriting existing files.

### Step 6 — Verify database schema

Run migrations to ensure the schema matches the restored database:

```bash
npm run migrate
```

### Step 7 — Restart the server

```bash
pm2 start ecosystem.config.js
# verify it started:
pm2 status
pm2 logs --lines 50
```

### Step 8 — Verify the restore

1. Open the admin panel at `/admin` and log in
2. Check that content looks correct
3. Check that media files load (visit a page with images)
4. Check server logs for errors: `pm2 logs`

---

## Rollback (Undo a Restore)

If something went wrong, the pre-restore snapshot is saved automatically at:

```
backups/db/pre-restore-<timestamp>.db
```

To rollback:
```bash
pm2 stop ecosystem.config.js
cp backups/db/pre-restore-<timestamp>.db data/payload.db
npm run migrate
pm2 start ecosystem.config.js
```

---

## Environment Variables for Cloud Backups

If cloud upload is configured, backups are also stored in S3/R2. To restore from cloud:

1. Download the backup file from your S3/R2 bucket (`backups/` prefix)
2. Place it in `backups/db/` or `backups/files/`
3. Follow the manual restore steps above

Cloud upload env vars (optional):
```env
BACKUP_S3_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com
BACKUP_S3_BUCKET=your-bucket-name
BACKUP_S3_KEY=your-access-key-id
BACKUP_S3_SECRET=your-secret-access-key
BACKUP_S3_REGION=auto
```

---

## Backup File Naming

| Pattern | Type |
|---------|------|
| `payload-YYYY-MM-DD_HH-MM-SS.db` | Database snapshot |
| `media-YYYY-MM-DD_HH-MM-SS.tar.gz` | Media files archive |
| `pre-restore-YYYY-MM-DD_HH-MM-SS.db` | Auto-snapshot before a restore |

---

*Generated for: tan@atech.software*
