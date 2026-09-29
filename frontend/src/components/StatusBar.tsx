/**
 * StatusBar.tsx — Shows the connection status of Backend, Database, and LLM.
 *
 * Backend: calls real GET /healthz (from Day 2)
 * Database: mocked as "Not connected" until Day 5
 * LLM: mocked as "Not connected" until Day 7
 *
 * WHY: Users need to know at a glance whether the system is ready.
 * A status bar prevents confusion when a service is down.
 */

import { useEffect, useState } from 'react'
import { checkHealth } from '../api/health'
import type { ServiceStatus } from '../types/query'

// ── Styling helpers ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  connected: '#16a34a',      // green
  disconnected: '#dc2626',   // red
  checking: '#d97706',       // amber
}

const STATUS_BG: Record<string, string> = {
  connected: '#f0fdf4',
  disconnected: '#fef2f2',
  checking: '#fffbeb',
}

const STATUS_DOT: Record<string, string> = {
  connected: '●',
  disconnected: '●',
  checking: '◌',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StatusBar() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Backend', status: 'checking' },
    { name: 'Database', status: 'disconnected', note: 'Day 5+' },
    { name: 'LLM', status: 'disconnected', note: 'Day 7+' },
  ])

  useEffect(() => {
    // Check real backend health on mount
    checkHealth()
      .then(() => {
        setServices((prev) =>
          prev.map((s) =>
            s.name === 'Backend' ? { ...s, status: 'connected' } : s
          )
        )
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) =>
            s.name === 'Backend' ? { ...s, status: 'disconnected' } : s
          )
        )
      })
  }, [])

  return (
    <div style={styles.bar}>
      {services.map((svc) => (
        <div
          key={svc.name}
          style={{
            ...styles.badge,
            background: STATUS_BG[svc.status],
            border: `1px solid ${STATUS_COLOR[svc.status]}33`,
          }}
        >
          <span style={{ color: STATUS_COLOR[svc.status], fontSize: '0.7rem' }}>
            {STATUS_DOT[svc.status]}
          </span>
          <span style={styles.badgeName}>{svc.name}</span>
          {svc.note && <span style={styles.badgeNote}>{svc.note}</span>}
        </div>
      ))}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: '0.8rem',
  },
  badgeName: {
    fontWeight: 600,
    color: '#374151',
  },
  badgeNote: {
    color: '#9ca3af',
    fontSize: '0.72rem',
  },
}
