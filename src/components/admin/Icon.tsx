import React from 'react'

export function AdminIcon() {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 8,
        // background: 'linear-gradient(135deg, #034F98 0%, #3c97eb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(3, 79, 152, 0.35)',
      }}
    >
      <span
        style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '-0.5px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Home
      </span>
    </div>
  )
}

export default AdminIcon
