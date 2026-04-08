import React from 'react'

export function AdminLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '4px 0',
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #034F98 0%, #3c97eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(3, 79, 152, 0.35)',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '-0.5px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          AB
        </span>
      </div>

      {/* Company name */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span
          style={{
            color: 'var(--theme-text)',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Atom Bondway
        </span>
        <span
          style={{
            color: 'var(--theme-text-dim)',
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Admin Panel
        </span>
      </div>
    </div>
  )
}

export default AdminLogo
