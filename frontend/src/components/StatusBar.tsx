/**
 * StatusBar.tsx — Service health telemetry pill bar.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Tabular numerals and high-contrast accessible text
 *  - Real-time status polling for Backend, Supabase Database, and OpenRouter AI
 */

import { useEffect, useState } from 'react'
import { Server, Database, Sparkles, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

interface ServiceState {
  name: string
  key: 'backend' | 'database' | 'llm'
  status: 'connected' | 'disconnected' | 'checking'
  label: string
  sublabel?: string
}

function mapStatus(raw: string | undefined): 'connected' | 'disconnected' | 'checking' {
  if (raw === 'ok' || raw === 'connected') return 'connected'
  if (raw === 'not_configured' || raw === 'disconnected') return 'disconnected'
  return 'checking'
}

export function StatusBar() {
  const [services, setServices] = useState<ServiceState[]>([
    { name: 'FastAPI Backend', key: 'backend', status: 'checking', label: 'Backend' },
    { name: 'Supabase Postgres', key: 'database', status: 'checking', label: 'Postgres DB' },
    { name: 'OpenRouter Free AI', key: 'llm', status: 'checking', label: 'AI Models' },
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastChecked, setLastChecked] = useState<string>('')

  const checkStatus = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/status`)
      if (!res.ok) throw new Error('Status check failed')
      const data = (await res.json()) as { backend: string; database: string; llm: string }

      setServices([
        {
          name: 'FastAPI Backend',
          key: 'backend',
          status: mapStatus(data.backend),
          label: 'Backend',
          sublabel: data.backend === 'ok' ? 'Online' : 'Offline',
        },
        {
          name: 'Supabase Postgres',
          key: 'database',
          status: mapStatus(data.database),
          label: 'Supabase DB',
          sublabel: data.database === 'connected' ? 'Connected' : 'Disconnected',
        },
        {
          name: 'OpenRouter AI',
          key: 'llm',
          status: mapStatus(data.llm),
          label: 'OpenRouter Free',
          sublabel: data.llm === 'connected' ? 'Active' : 'Unconfigured',
        },
      ])
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch {
      setServices([
        { name: 'FastAPI Backend', key: 'backend', status: 'disconnected', label: 'Backend', sublabel: 'Offline' },
        { name: 'Supabase Postgres', key: 'database', status: 'disconnected', label: 'Supabase DB', sublabel: 'Offline' },
        { name: 'OpenRouter AI', key: 'llm', status: 'disconnected', label: 'OpenRouter Free', sublabel: 'Offline' },
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getIcon = (key: string) => {
    switch (key) {
      case 'backend':
        return <Server size={13} aria-hidden="true" />
      case 'database':
        return <Database size={13} aria-hidden="true" />
      case 'llm':
        return <Sparkles size={13} aria-hidden="true" />
      default:
        return <Server size={13} aria-hidden="true" />
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.badgeGroup}>
        {services.map((svc) => {
          const isConnected = svc.status === 'connected'
          const isChecking = svc.status === 'checking'

          const statusColor = isConnected
            ? 'var(--accent-success)'
            : isChecking
            ? 'var(--accent-warning)'
            : 'var(--accent-danger)'

          const statusBg = isConnected
            ? 'var(--accent-success-subtle)'
            : isChecking
            ? 'var(--accent-warning-subtle)'
            : 'var(--accent-danger-subtle)'

          const statusBorder = isConnected
            ? 'var(--accent-success-border)'
            : isChecking
            ? 'var(--accent-warning-border)'
            : 'var(--accent-danger-border)'

          return (
            <div
              key={svc.key}
              style={{
                ...styles.pill,
                backgroundColor: statusBg,
                borderColor: statusBorder,
              }}
              title={`${svc.name}: ${svc.sublabel ?? svc.status}`}
            >
              <span style={{ ...styles.iconWrapper, color: statusColor }}>
                {getIcon(svc.key)}
              </span>
              <span style={styles.pillLabel}>{svc.label}</span>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: statusColor,
                }}
                className={isConnected ? 'pulsing-dot' : ''}
              />
              <span style={{ ...styles.statusText, color: statusColor }}>
                {svc.sublabel ?? svc.status}
              </span>
            </div>
          )
        })}
      </div>

      <button
        style={styles.refreshBtn}
        onClick={checkStatus}
        disabled={isRefreshing}
        title={lastChecked ? `Last checked: ${lastChecked}. Click to refresh status` : 'Refresh status'}
        aria-label="Refresh service connection status"
      >
        <RefreshCw size={12} className={isRefreshing ? 'spin-anim' : ''} />
        {isRefreshing ? 'Checking…' : 'Ping'}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 9px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  pillLabel: {
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '0.72rem',
    fontWeight: 500,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
}
