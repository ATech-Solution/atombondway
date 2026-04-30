'use client'

import React, { useCallback, useEffect, useState } from 'react'

type BackupEntry = {
  name: string
  size: number
  mtime: string
}

type BackupList = {
  db: BackupEntry[]
  files: BackupEntry[]
}

type PluginStatus = 'active' | 'inactive' | 'unknown'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function BackupView() {
  const [pluginStatus, setPluginStatus] = useState<PluginStatus>('unknown')
  const [backups, setBackups] = useState<BackupList>({ db: [], files: [] })
  const [loading, setLoading] = useState(true)
  const [runningBackup, setRunningBackup] = useState(false)
  const [restoringDb, setRestoringDb] = useState<string | null>(null)
  const [restoringFiles, setRestoringFiles] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<{ type: 'db' | 'files'; name: string } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 6000)
  }

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/plugins/backup/list')
      if (!res.ok) throw new Error('Failed to load backup list')
      const data = await res.json()
      setPluginStatus(data.pluginStatus ?? 'unknown')
      setBackups(data.backups ?? { db: [], files: [] })
    } catch (err) {
      console.error(err)
      setPluginStatus('unknown')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleRunBackup = async () => {
    setRunningBackup(true)
    setMessage(null)
    try {
      const res = await fetch('/api/plugins/backup/run', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Backup failed')
      showMessage('success', `Backup completed: DB → ${data.dbFile?.split('/').pop()}, Files → ${data.filesFile?.split('/').pop()}`)
      await fetchStatus()
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Backup failed')
    } finally {
      setRunningBackup(false)
    }
  }

  const handleRestore = async (type: 'db' | 'files', name: string) => {
    if (type === 'db') setRestoringDb(name)
    else setRestoringFiles(name)
    setMessage(null)
    try {
      const body = type === 'db' ? { dbFile: name } : { filesFile: name }
      const res = await fetch('/api/plugins/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Restore failed')
      showMessage('success', `Restore complete: ${data.restored?.join(', ')}`)
      await fetchStatus()
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Restore failed')
    } finally {
      if (type === 'db') setRestoringDb(null)
      else setRestoringFiles(null)
    }
  }

  const handleDownload = (type: 'db' | 'files', name: string) => {
    window.open(`/api/plugins/backup/download?type=${type}&file=${encodeURIComponent(name)}`, '_blank')
  }

  const statusColor = pluginStatus === 'active' ? '#16a34a' : pluginStatus === 'inactive' ? '#dc2626' : '#9ca3af'
  const statusLabel = pluginStatus === 'active' ? 'Active' : pluginStatus === 'inactive' ? 'Inactive' : 'Unknown'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Backup &amp; Restore
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Create and manage backups of your database and media files.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '9999px',
          background: pluginStatus === 'active' ? '#dcfce7' : pluginStatus === 'inactive' ? '#fee2e2' : '#f3f4f6',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: statusColor,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
          Plugin {statusLabel}
        </div>
        {pluginStatus === 'inactive' && (
          <p style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>
            Enable this plugin in the Plugins collection to run backups.
          </p>
        )}
      </div>

      {/* Message banner */}
      {message && (
        <div style={{
          padding: '0.875rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#15803d' : '#dc2626',
          fontSize: '0.875rem',
          border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmRestore && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '2rem',
            maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Confirm Restore</h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.875rem' }}>
              This will overwrite your current {confirmRestore.type === 'db' ? 'database' : 'media files'} with:
            </p>
            <p style={{
              background: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: '6px',
              fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '1.25rem', wordBreak: 'break-all',
            }}>
              {confirmRestore.name}
            </p>
            <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              A pre-restore snapshot will be saved automatically before overwriting.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmRestore(null)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db',
                  background: '#fff', cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { type, name } = confirmRestore
                  setConfirmRestore(null)
                  handleRestore(type, name)
                }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                  background: '#dc2626', color: '#fff', cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: 600,
                }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Backup */}
      <div style={{
        border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Run Backup</h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Creates a snapshot of the SQLite database and a compressed archive of all media files.
          {process.env.NEXT_PUBLIC_BACKUP_CLOUD === 'true' && ' Files will also be uploaded to cloud storage.'}
        </p>
        <button
          onClick={handleRunBackup}
          disabled={runningBackup || pluginStatus !== 'active' || loading}
          style={{
            padding: '0.625rem 1.25rem',
            background: pluginStatus === 'active' && !runningBackup ? '#034F98' : '#9ca3af',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: pluginStatus === 'active' && !runningBackup ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {runningBackup ? 'Running backup...' : 'Run Backup Now'}
        </button>
      </div>

      {loading && (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading backup history...</p>
      )}

      {/* DB Backups */}
      {!loading && (
        <div style={{
          border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
            Database Backups ({backups.db.length})
          </h2>
          {backups.db.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No database backups yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>File</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>Size</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>Created</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.db.map((entry) => (
                  <tr key={entry.name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#111827' }}>
                      {entry.name}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#6b7280' }}>
                      {formatBytes(entry.size)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#6b7280' }}>
                      {formatDate(entry.mtime)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleDownload('db', entry.name)}
                          style={actionBtnStyle('#f3f4f6', '#374151')}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => setConfirmRestore({ type: 'db', name: entry.name })}
                          disabled={restoringDb === entry.name}
                          style={actionBtnStyle('#fee2e2', '#dc2626')}
                        >
                          {restoringDb === entry.name ? 'Restoring...' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* File Backups */}
      {!loading && (
        <div style={{
          border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '1.5rem',
        }}>
          <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
            File Backups ({backups.files.length})
          </h2>
          {backups.files.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No file backups yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>File</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>Size</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>Created</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.files.map((entry) => (
                  <tr key={entry.name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#111827' }}>
                      {entry.name}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#6b7280' }}>
                      {formatBytes(entry.size)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#6b7280' }}>
                      {formatDate(entry.mtime)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleDownload('files', entry.name)}
                          style={actionBtnStyle('#f3f4f6', '#374151')}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => setConfirmRestore({ type: 'files', name: entry.name })}
                          disabled={restoringFiles === entry.name}
                          style={actionBtnStyle('#fee2e2', '#dc2626')}
                        >
                          {restoringFiles === entry.name ? 'Restoring...' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function actionBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '0.375rem 0.75rem',
    background: bg,
    color,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
  }
}

export default BackupView
