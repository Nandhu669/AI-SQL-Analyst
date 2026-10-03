/**
 * StatusBar.tsx — Shows connection status of Backend, Database, and LLM.
 *
 * Day 3: Backend badge was real (/healthz). DB and LLM were hardcoded "disconnected".
 * Day 5: All 3 badges now come from GET /api/v1/status — one call, real data.
 *
 * The /api/v1/status endpoint returns:
 *   { backend: "ok", database: "connected" | "disconnected", llm: "not_configured" | "connected" }
 */

import { useEffect, useState } from 'react'
import type { ServiceStatus } from '../types/query'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// ── Styling helpers ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  connected: '#16a34a',
  disconnected: '#dc2626',
  checking: '#d97706',
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

// Map raw API values to our ServiceConnectionStatus type
function mapStatus(raw: string | undefined): ServiceStatus['status'] {
  if (raw === 'ok' || raw === 'connected') return 'connected'
  if (raw === 'not_configured' || raw === 'disconnected') return 'disconnected'
  return 'checking'
}

function mapNote(raw: string | undefined, name: string): string | undefined {
  if (name === 'LLM' && raw === 'not_configured') return 'Day 7+'
  return undefined
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StatusBar() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Backend',  status: 'checking' },
    { name: 'Database', status: 'checking' },
    { name: 'LLM',      status: 'checking' },
  ])

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/status`)
      .then((res) => {
        if (!res.ok) throw new Error('Status check failed')
        return res.json() as Promise<{ backend: string; database: string; llm: string }>
      })
      .then((data) => {
        setServices([
          { name: 'Backend',  status: mapStatus(data.backend),   note: mapNote(data.backend, 'Backend') },
          { name: 'Database', status: mapStatus(data.database),  note: mapNote(data.database, 'Database') },
          { name: 'LLM',      status: mapStatus(data.llm),       note: mapNote(data.llm, 'LLM') },
        ])
      })
      .catch(() => {
        setServices([
          { name: 'Backend',  status: 'disconnected' },
          { name: 'Database', status: 'disconnected' },
          { name: 'LLM',      status: 'disconnected' },
        ])
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
