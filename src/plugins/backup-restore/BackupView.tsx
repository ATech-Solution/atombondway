'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type BackupType = 'db' | 'files' | 'project' | 'unknown'
type StorageType = 'local' | 'gdrive'

type BackupEntry = {
  name: string
  type: BackupType
  size: number
  mtime: string
  storage: StorageType
  driveId?: string
  webViewLink?: string
}

type GDriveStatus = {
  configured: boolean
  connected: boolean
}

type PluginStatus = 'active' | 'inactive' | 'unknown'

type Scope = 'db' | 'files' | 'project'
type Destination = 'local' | 'gdrive'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function typeBadge(type: BackupType): React.ReactNode {
  const map: Record<BackupType, { label: string; bg: string; color: string }> = {
    db: { label: 'DB', bg: '#dbeafe', color: '#1d4ed8' },
    files: { label: 'Media', bg: '#fef9c3', color: '#a16207' },
    project: { label: 'Project', bg: '#dcfce7', color: '#166534' },
    unknown: { label: '?', bg: '#f3f4f6', color: '#6b7280' },
  }
  const { label, bg, color } = map[type]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 7px',
        borderRadius: '9999px',
        background: bg,
        color,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  )
}

function StorageIcon({ storage }: { storage: StorageType }) {
  if (storage === 'gdrive') {
    return (
      <span
        title="Google Drive"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#4285f4',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        G
      </span>
    )
  }
  return (
    <span title="Local Storage" style={{ fontSize: '1rem' }}>
      💾
    </span>
  )
}

// ─── CSS keyframes injected once ─────────────────────────────────────────────

const SHIMMER_CSS = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

// ─── Main Component ───────────────────────────────────────────────────────────

export function BackupView() {
  const [pluginStatus, setPluginStatus] = useState<PluginStatus>('unknown')
  const [gdrive, setGdrive] = useState<GDriveStatus>({ configured: false, connected: false })
  const [backups, setBackups] = useState<BackupEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Backup control state
  const [scope, setScope] = useState<Record<Scope, boolean>>({ db: true, files: true, project: true })
  const [destinations, setDestinations] = useState<Record<Destination, boolean>>({ local: true, gdrive: false })
  const [running, setRunning] = useState(false)

  // Per-row restore state
  const [restoring, setRestoring] = useState<string | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<BackupEntry | null>(null)

  // Per-row delete state
  const [confirmDelete, setConfirmDelete] = useState<BackupEntry | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Upload state
  const [uploadDragging, setUploadDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, text })
    toastTimer.current = setTimeout(() => setToast(null), 6000)
  }

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/plugins/backup/list')
      if (!res.ok) throw new Error('Failed to load backup list')
      const data = await res.json()
      setPluginStatus(data.pluginStatus ?? 'unknown')
      setGdrive(data.gdrive ?? { configured: false, connected: false })
      setBackups(data.backups ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // ─── Backup ────────────────────────────────────────────────────────────────

  const handleRunBackup = async () => {
    const selectedScope = (Object.keys(scope) as Scope[]).filter((k) => scope[k])
    const selectedDest = (Object.keys(destinations) as Destination[]).filter((k) => destinations[k])

    if (selectedScope.length === 0) {
      showToast('error', 'Select at least one backup type.')
      return
    }
    if (selectedDest.length === 0) {
      showToast('error', 'Select at least one storage destination.')
      return
    }

    setRunning(true)
    try {
      const res = await fetch('/api/plugins/backup/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: selectedScope, destinations: selectedDest }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Backup failed')
      const parts = [
        data.dbFile && `DB: ${data.dbFile}`,
        data.filesFile && `Media: ${data.filesFile}`,
        data.projectFile && `Project: ${data.projectFile}`,
      ].filter(Boolean)
      showToast('success', `Backup complete — ${parts.join(', ')}`)
      await fetchStatus()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Backup failed')
    } finally {
      setRunning(false)
    }
  }

  // ─── Restore ───────────────────────────────────────────────────────────────

  const handleRestore = async (entry: BackupEntry) => {
    setRestoring(entry.name)
    try {
      const body: Record<string, string> = {}
      if (entry.type === 'db') body.dbFile = entry.name
      else if (entry.type === 'files') body.filesFile = entry.name
      else if (entry.type === 'project') body.projectFile = entry.name

      const res = await fetch('/api/plugins/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Restore failed')
      showToast('success', `Restore complete: ${data.restored?.join(', ')}`)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Restore failed')
    } finally {
      setRestoring(null)
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (entry: BackupEntry) => {
    setDeleting(entry.name)
    try {
      const res = await fetch('/api/plugins/backup/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: entry.type,
          name: entry.name,
          storage: entry.storage,
          driveId: entry.driveId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      showToast('success', `Deleted: ${entry.name}`)
      await fetchStatus()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  // ─── Download ──────────────────────────────────────────────────────────────

  const handleDownload = (entry: BackupEntry) => {
    if (entry.storage === 'gdrive' && entry.driveId) {
      window.open(
        `/api/plugins/backup/gdrive?action=download&id=${entry.driveId}&name=${encodeURIComponent(entry.name)}`,
        '_blank',
      )
    } else {
      window.open(
        `/api/plugins/backup/download?type=${entry.type}&file=${encodeURIComponent(entry.name)}`,
        '_blank',
      )
    }
  }

  // ─── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate progress with increments since fetch doesn't expose upload progress natively
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 85))
      }, 200)

      const res = await fetch('/api/plugins/backup/upload', {
        method: 'POST',
        body: formData,
      })
      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      showToast('success', `Uploaded ${data.name} (${formatBytes(data.size)}) → ${data.destination}`)
      await fetchStatus()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 600)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const statusColor =
    pluginStatus === 'active' ? '#16a34a' : pluginStatus === 'inactive' ? '#dc2626' : '#9ca3af'
  const statusLabel =
    pluginStatus === 'active' ? 'Active' : pluginStatus === 'inactive' ? 'Inactive' : 'Unknown'
  const isActive = pluginStatus === 'active'

  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div style={{ padding: '2rem', maxWidth: '960px', fontFamily: 'inherit' }}>

        {/* ── Toast ───────────────────────────────────────────────────────── */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 10000,
              padding: '0.875rem 1.25rem',
              borderRadius: '10px',
              background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: toast.type === 'success' ? '#15803d' : '#dc2626',
              border: `1px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
              fontSize: '0.875rem',
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              maxWidth: '380px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {toast.type === 'success' ? '✅ ' : '❌ '}
            {toast.text}
          </div>
        )}

        {/* ── Confirm Restore Dialog ───────────────────────────────────────── */}
        {confirmRestore && (
          <ConfirmDialog
            title="Confirm Restore"
            message={
              <>
                This will overwrite your current{' '}
                <strong>{confirmRestore.type === 'db' ? 'database' : confirmRestore.type === 'files' ? 'media files' : 'project files'}</strong>{' '}
                with the selected backup. A pre-restore snapshot will be saved automatically.
                {confirmRestore.type === 'project' && (
                  <span style={{ display: 'block', marginTop: '0.5rem', color: '#dc2626' }}>
                    ⚠️ Project files restore will restart your application. .env files are preserved.
                  </span>
                )}
              </>
            }
            fileName={confirmRestore.name}
            danger
            confirmLabel="Restore"
            onCancel={() => setConfirmRestore(null)}
            onConfirm={() => {
              const entry = confirmRestore
              setConfirmRestore(null)
              handleRestore(entry)
            }}
          />
        )}

        {/* ── Confirm Delete Dialog ────────────────────────────────────────── */}
        {confirmDelete && (
          <ConfirmDialog
            title="Delete Backup"
            message={`This will permanently delete this backup from ${confirmDelete.storage === 'gdrive' ? 'Google Drive' : 'local storage'}. This cannot be undone.`}
            fileName={confirmDelete.name}
            danger
            confirmLabel="Delete"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => {
              const entry = confirmDelete
              handleDelete(entry)
            }}
          />
        )}

        {/* ── Section 1: Header + Controls ────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              🗄️ Backup &amp; Restore
            </h1>
            <StatusBadge status={pluginStatus} label={statusLabel} color={statusColor} />
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Create and manage backups of your database, media files, and project source code.
          </p>
        </div>

        <Card>
          <h2 style={sectionTitle}>Backup</h2>

          {/* Backup scope */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={fieldLabel}>What to back up</p>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {(['db', 'files', 'project'] as Scope[]).map((key) => (
                <CheckboxField
                  key={key}
                  id={`scope-${key}`}
                  checked={scope[key]}
                  onChange={(v) => setScope((s) => ({ ...s, [key]: v }))}
                  label={key === 'db' ? '🗃 Database (SQLite)' : key === 'files' ? '🖼 Media Files' : '📁 Project Files'}
                  description={
                    key === 'project' ? 'Source code (excludes node_modules, .next, build folders)' : undefined
                  }
                />
              ))}
            </div>
          </div>

          {/* Storage destination */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={fieldLabel}>Where to save</p>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <CheckboxField
                id="dest-local"
                checked={destinations.local}
                onChange={(v) => setDestinations((d) => ({ ...d, local: v }))}
                label="💾 Save Locally"
              />
              <CheckboxField
                id="dest-gdrive"
                checked={destinations.gdrive}
                onChange={(v) => setDestinations((d) => ({ ...d, gdrive: v }))}
                label="🔵 Google Drive"
                disabled={!gdrive.configured}
                extra={
                  gdrive.configured && !gdrive.connected ? (
                    <a
                      href="/api/plugins/backup/gdrive?action=auth"
                      style={{ fontSize: '0.75rem', color: '#4285f4', textDecoration: 'none' }}
                    >
                      Connect →
                    </a>
                  ) : !gdrive.configured ? (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Setup required</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>✓ Connected</span>
                  )
                }
              />
            </div>
            {!gdrive.configured && (
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Add <code>GOOGLE_DRIVE_CLIENT_ID</code> &amp; <code>GOOGLE_DRIVE_CLIENT_SECRET</code> to your .env to enable Google Drive.
              </p>
            )}
          </div>

          {/* Run button + progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRunBackup}
              disabled={!isActive || running || loading}
              style={primaryBtn(!isActive || running || loading)}
            >
              {running ? '⏳ Running backup...' : '▶ Run Backup Now'}
            </button>
            {!isActive && pluginStatus !== 'unknown' && (
              <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>
                Enable this plugin in System → Plugins first.
              </span>
            )}
          </div>

          {/* Animated progress bar */}
          {running && (
            <div style={{ marginTop: '1rem' }}>
              <ProgressBar indeterminate />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Backup in progress — this may take a moment for large project backups…
              </p>
            </div>
          )}
        </Card>

        {/* ── Section 2: Backup List ───────────────────────────────────────── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ ...sectionTitle, margin: 0 }}>
              Backup History{' '}
              {!loading && (
                <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.85rem' }}>
                  ({backups.length} file{backups.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
            <button
              onClick={fetchStatus}
              disabled={loading}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.25rem 0.625rem',
                fontSize: '0.8rem',
                cursor: loading ? 'default' : 'pointer',
                color: '#6b7280',
              }}
            >
              {loading ? '⟳ Loading…' : '⟳ Refresh'}
            </button>
          </div>

          {loading ? (
            <div style={{ paddingBottom: '0.5rem' }}>
              <ProgressBar indeterminate />
            </div>
          ) : backups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p style={{ margin: 0 }}>No backups yet. Run your first backup above.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['File', 'Type', 'Date / Time', 'Storage', 'Size', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: h === 'Actions' || h === 'Size' ? 'right' : 'left',
                          color: '#6b7280',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backups.map((entry) => {
                    const isRestoring = restoring === entry.name
                    const isDeleting = deleting === entry.name
                    return (
                      <React.Fragment key={`${entry.storage}-${entry.name}`}>
                        <tr
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            background: isRestoring ? '#fefce8' : 'transparent',
                            transition: 'background 0.2s',
                          }}
                        >
                          <td
                            style={{
                              padding: '0.625rem 0.75rem',
                              fontFamily: 'monospace',
                              fontSize: '0.78rem',
                              color: '#111827',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={entry.name}
                          >
                            {entry.name}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem' }}>
                            {typeBadge(entry.type)}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                            {formatDate(entry.mtime)}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem' }}>
                            <StorageIcon storage={entry.storage} />
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#6b7280', whiteSpace: 'nowrap' }}>
                            {formatBytes(entry.size)}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.375rem', alignItems: 'center' }}>
                              {/* Download */}
                              <button
                                onClick={() => handleDownload(entry)}
                                title={`Download (${formatBytes(entry.size)})`}
                                style={actionBtn('#f3f4f6', '#374151')}
                              >
                                ⬇ Download
                              </button>
                              {/* Restore — only for local db/files/project */}
                              {entry.storage === 'local' && entry.type !== 'unknown' && (
                                <button
                                  onClick={() => setConfirmRestore(entry)}
                                  disabled={!!restoring}
                                  title="Restore from this backup"
                                  style={actionBtn('#fef3c7', '#92400e', !!restoring)}
                                >
                                  {isRestoring ? '⏳' : '↩ Restore'}
                                </button>
                              )}
                              {/* Delete */}
                              <button
                                onClick={() => setConfirmDelete(entry)}
                                disabled={isDeleting}
                                title="Delete this backup"
                                style={{
                                  ...actionBtn('#fee2e2', '#dc2626', isDeleting),
                                  padding: '0.3rem 0.5rem',
                                }}
                              >
                                {isDeleting ? '⏳' : '🗑'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Inline restore progress bar */}
                        {isRestoring && (
                          <tr>
                            <td colSpan={6} style={{ padding: '0 0.75rem 0.75rem' }}>
                              <ProgressBar indeterminate label="Restoring…" />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Section 3: Upload ────────────────────────────────────────────── */}
        <Card>
          <h2 style={sectionTitle}>Upload Backup File</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Import a <code>.db</code>, <code>.tar.gz</code>, or <code>.zip</code> backup file. It will be placed in the correct local backup folder automatically.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setUploadDragging(true) }}
            onDragLeave={() => setUploadDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setUploadDragging(false)
              handleUpload(e.dataTransfer.files)
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${uploadDragging ? '#034F98' : '#d1d5db'}`,
              borderRadius: '12px',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer',
              background: uploadDragging ? '#eff6ff' : '#fafafa',
              transition: 'all 0.15s',
              userSelect: 'none',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
            <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#374151' }}>
              {uploading ? 'Uploading…' : 'Drop a backup file here'}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
              or click to browse — .db, .tar.gz, .zip accepted
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".db,.tar.gz,.gz,.zip"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files)}
          />

          {uploading && (
            <div style={{ marginTop: '1rem' }}>
              <ProgressBar value={uploadProgress} />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Processing…'}
              </p>
            </div>
          )}
        </Card>

        {/* ── Restore Guide ────────────────────────────────────────────────── */}
        <RestoreGuide />
      </div>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: '#fff',
      }}
    >
      {children}
    </div>
  )
}

function StatusBadge({ status, label, color }: { status: PluginStatus; label: string; color: string }) {
  const bg = status === 'active' ? '#dcfce7' : status === 'inactive' ? '#fee2e2' : '#f3f4f6'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '9999px',
        background: bg,
        fontSize: '0.8rem',
        fontWeight: 600,
        color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      Plugin {label}
    </span>
  )
}

function CheckboxField({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
  extra,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  extra?: React.ReactNode
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: '2px', accentColor: '#034F98', width: 15, height: 15 }}
      />
      <span>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{label}</span>
        {description && (
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af' }}>{description}</span>
        )}
        {extra && <span style={{ display: 'block', marginTop: '0.2rem' }}>{extra}</span>}
      </span>
    </label>
  )
}

function ProgressBar({ indeterminate, value, label }: { indeterminate?: boolean; value?: number; label?: string }) {
  return (
    <div>
      {label && <p style={{ margin: '0 0 0.375rem', fontSize: '0.8rem', color: '#6b7280' }}>{label}</p>}
      <div
        style={{
          height: 6,
          borderRadius: '9999px',
          background: '#e5e7eb',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {indeterminate ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '40%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, transparent, #034F98, transparent)',
              backgroundSize: '400px 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}
          />
        ) : (
          <div
            style={{
              height: '100%',
              width: `${value ?? 0}%`,
              borderRadius: '9999px',
              background: '#034F98',
              transition: 'width 0.2s ease',
            }}
          />
        )}
      </div>
    </div>
  )
}

function ConfirmDialog({
  title,
  message,
  fileName,
  danger,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  message: React.ReactNode
  fileName: string
  danger?: boolean
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '2rem',
          maxWidth: '440px',
          width: '90%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        }}
      >
        <h3 style={{ fontWeight: 700, marginTop: 0, marginBottom: '0.75rem' }}>{title}</h3>
        <p style={{ color: '#4b5563', marginBottom: '0.875rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {message}
        </p>
        <p
          style={{
            background: '#f9fafb',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            marginBottom: '1.5rem',
            wordBreak: 'break-all',
            color: '#374151',
          }}
        >
          {fileName}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: danger ? '#dc2626' : '#034F98',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function RestoreGuide() {
  const [open, setOpen] = useState(false)

  const steps = [
    { n: 1, title: 'Download the backup', body: 'In the Backup History table, click ⬇ Download on the backup you want to restore. Save it somewhere safe.' },
    { n: 2, title: 'Stop the server', body: 'Run: pm2 stop ecosystem.config.js (or your equivalent process manager command).' },
    { n: 3, title: 'Trigger restore', body: 'Option A (easiest): Use the ↩ Restore button in the admin panel above.\nOption B (CLI): Run npm run restore and follow the interactive prompts.\nOption C (manual): Copy the .db file to data/payload.db, or extract the .tar.gz to public/media.' },
    { n: 4, title: 'Verify schema', body: 'Run: npm run migrate — this confirms the restored database schema is up-to-date.' },
    { n: 5, title: 'Restart the server', body: 'Run: pm2 start ecosystem.config.js' },
    { n: 6, title: 'Verify', body: 'Open the site. Check admin login, media URLs, and key pages. If anything looks wrong, locate the pre-restore-*.db file in backups/db/ — that is your rollback.' },
  ]

  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        <h2 style={{ ...sectionTitle, margin: 0, flex: 1, textAlign: 'left' }}>📋 Restore Guide</h2>
        <span style={{ color: '#6b7280', fontSize: '1.1rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ marginTop: '1.25rem', animation: 'fadeIn 0.15s ease' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 0 }}>
            Follow these steps to safely restore a backup on your server.
          </p>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {steps.map((s) => (
              <li key={s.n} style={{ marginBottom: '0.875rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#111827' }}>
                  {s.title}
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#4b5563', whiteSpace: 'pre-line' }}>
                  {s.body}
                </span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e' }}>
              💡 <strong>Rollback tip:</strong> Before any restore, the system automatically saves a <code>pre-restore-*.db</code> snapshot in <code>backups/db/</code>. If something goes wrong, restore that file manually.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '1rem',
  marginTop: 0,
  marginBottom: '1.25rem',
  color: '#111827',
}

const fieldLabel: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  margin: '0 0 0.625rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: '0.625rem 1.375rem',
    background: disabled ? '#9ca3af' : '#034F98',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
  }
}

function actionBtn(bg: string, color: string, disabled = false): React.CSSProperties {
  return {
    padding: '0.3rem 0.625rem',
    background: disabled ? '#f3f4f6' : bg,
    color: disabled ? '#9ca3af' : color,
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.78rem',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    transition: 'background 0.15s',
  }
}

export default BackupView
