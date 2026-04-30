export const PLUGIN_METADATA = {
  slug: 'backup-restore',
  name: 'Backup & Restore',
  description: 'Backup and restore the SQLite database and media files. Supports local storage and optional cloud upload (S3/R2).',
  version: '1.0.0',
} as const

export { backupDatabase, backupFiles, listBackups } from './handlers/backup'
export { restoreDatabase, restoreFiles } from './handlers/restore'
export { uploadToCloud } from './handlers/cloud'
