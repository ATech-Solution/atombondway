export const PLUGIN_METADATA = {
  slug: 'backup-restore',
  name: 'Backup & Restore',
  description: 'Backup and restore the SQLite database, media files, and project source code. Supports local storage and Google Drive via OAuth2.',
  version: '2.0.0',
} as const

export { backupDatabase, backupFiles, backupProjectFiles, listBackups } from './handlers/backup'
export { restoreDatabase, restoreFiles, restoreProjectFiles } from './handlers/restore'
export { uploadToCloud, uploadToGoogleDrive, isGoogleDriveConnected } from './handlers/cloud'
