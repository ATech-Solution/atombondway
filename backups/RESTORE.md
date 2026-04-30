# Restore Guide — Atombondway

Step-by-step instructions for restoring your site from a backup. Follow these steps carefully on the server.

---

## Prerequisites

- SSH access to the server
- Node.js ≥ 20 and npm installed
- PM2 (if using for process management)
- The backup file you want to restore (download from admin panel or Google Drive)

---

## Step 1 — Download the backup file

**Via admin panel:**
1. Go to **Admin → Backup & Restore**
2. In the Backup History table, click **⬇ Download** on the backup you want to restore
3. Save the file to your computer

**Via Google Drive:**
1. Open your Google Drive backup folder
2. Download the relevant file

**Types:**
| File pattern | Restores |
|--------------|---------|
| `payload-*.db` | SQLite database |
| `pre-restore-*.db` | Pre-restore snapshot (rollback) |
| `media-*.tar.gz` | Media files (`public/media/`) |
| `project-*.tar.gz` | Project source code |

---

## Step 2 — Stop the server

```bash
pm2 stop ecosystem.config.js
```

> If you are not using PM2, use your equivalent (systemd, Docker, etc.).

---

## Step 3 — Restore

### Option A — Admin Panel (easiest)
1. Upload the backup file via the **Upload** section in the admin panel
2. Click **↩ Restore** on the uploaded file
3. Confirm the dialog
4. The system creates a `pre-restore-*.db` snapshot automatically before overwriting

### Option B — CLI (interactive)
```bash
npm run restore
```
Follow the prompts to select which backup file to restore for each type.

### Option C — Manual

**Database:**
```bash
# First, create a manual snapshot (safety)
cp data/payload.db backups/db/manual-pre-restore-$(date +%Y%m%d_%H%M%S).db

# Then restore
cp backups/db/payload-YYYY-MM-DD_HH-MM-SS.db data/payload.db
```

**Media files:**
```bash
tar -xzf backups/files/media-YYYY-MM-DD_HH-MM-SS.tar.gz -C public/
```

**Project files:**
```bash
# Restore project source (excludes .env files automatically)
tar -xzf backups/project/project-YYYY-MM-DD_HH-MM-SS.tar.gz -C . --exclude=".env*"
```

---

## Step 4 — Verify schema

After restoring the database, confirm migrations are up-to-date:

```bash
npm run migrate
```

If this fails, the backup may be from a different schema version. Check the error and apply any missing migrations manually.

---

## Step 5 — Reinstall dependencies (project restore only)

If you restored project source files:

```bash
npm install
npm run build
```

---

## Step 6 — Restart the server

```bash
pm2 start ecosystem.config.js
```

---

## Step 7 — Verify

1. Open the site URL in your browser
2. Check the admin panel login at `/admin`
3. Check that media files load correctly (look at an image on the site)
4. Browse a few key pages to confirm data is correct

---

## Rollback

If the restore made things worse, roll back to the pre-restore snapshot:

```bash
# A pre-restore-*.db file is saved automatically in backups/db/ before every restore
ls -la backups/db/ | grep pre-restore

# Roll back
pm2 stop ecosystem.config.js
cp backups/db/pre-restore-YYYY-MM-DD_HH-MM-SS.db data/payload.db
pm2 start ecosystem.config.js
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Admin login doesn't work after DB restore | Run `npm run migrate` — schema may be stale |
| Media shows broken images | Check that `public/media/` was extracted correctly; verify `PAYLOAD_MEDIA_DIR` env var |
| Site shows build errors after project restore | Run `npm install && npm run build` |
| PM2 fails to start | Check `pm2 logs` for errors; confirm the `ecosystem.config.js` is intact |
