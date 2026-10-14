/**
 * SecurityAuditLogs.tsx — Persistent Security & AST Audit Trail.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Real Supabase telemetry from `query_audit_logs` table
 *  - Displays verified read-only passes and blocked mutation attempts
 *  - Tabular numerals for timestamps and UUID prefixes
 */

import { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Search,
  Database,
  Lock,
} from 'lucide-react'
import { fetchAuditLogs } from '../api/mcp'
import type { AuditLogItem } from '../types/query'

export function SecurityAuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  const loadAudits = async () => {
    setLoading(true)
    setError('')
    try {
      const items = await fetchAuditLogs()
      setLogs(items)
    } catch {
      setError('Failed to fetch security audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudits()
  }, [])

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return isoString
    }
  }

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs
    const term = search.toLowerCase()
    return logs.filter(
      (log) =>
        (log.reason && log.reason.toLowerCase().includes(term)) ||
        log.id.toLowerCase().includes(term) ||
        (log.query_id && log.query_id.toLowerCase().includes(term))
    )
  }, [logs, search])

  return (
    <div style={styles.container}>
      {/* Header controls */}
      <div style={styles.controlsRow}>
        <div style={styles.searchBox}>
          <Search size={12} style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Filter security audits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter audit logs"
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        <button
          style={styles.refreshBtn}
          onClick={loadAudits}
          disabled={loading}
          title="Refresh audit logs"
          aria-label="Refresh audit logs"
        >
          <RefreshCw size={12} className={loading ? 'spin-anim' : ''} />
          <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      {/* Safety Summary Banner */}
      <div style={styles.summaryBanner}>
        <div style={styles.summaryLeft}>
          <Lock size={13} style={{ color: 'var(--accent-success)' }} />
          <span style={styles.summaryTitle}>AST Security Guard Active</span>
        </div>
        <span style={styles.summaryBadge} className="tabular-nums">
          {logs.length} logged events
        </span>
      </div>

      {/* List / Content */}
      {loading && logs.length === 0 ? (
        <div style={styles.loadingWrapper}>
          <div className="skeleton-loading" style={{ height: 48, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
          <div className="skeleton-loading" style={{ height: 48, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
          <div className="skeleton-loading" style={{ height: 48, borderRadius: 'var(--radius-sm)' }} />
        </div>
      ) : error ? (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={loadAudits}>
            Retry
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div style={styles.empty}>
          <Database size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
          <p style={styles.emptyText}>No security audit records logged yet.</p>
          <span style={styles.emptySubtext}>Execute any query to record AST verification telemetry.</span>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredLogs.map((log) => {
            const isSafe = log.safety_check && log.read_only_verified
            return (
              <div
                key={log.id}
                style={{
                  ...styles.logCard,
                  borderColor: isSafe ? 'var(--border-subtle)' : 'var(--accent-danger-border)',
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.statusIndicator}>
                    {isSafe ? (
                      <ShieldCheck size={14} style={{ color: 'var(--accent-success)' }} />
                    ) : (
                      <ShieldAlert size={14} style={{ color: 'var(--accent-danger)' }} />
                    )}
                    <span
                      style={{
                        ...styles.statusLabel,
                        color: isSafe ? 'var(--accent-success)' : 'var(--accent-danger)',
                      }}
                    >
                      {isSafe ? 'Read-Only Verified' : 'Security Violation Blocked'}
                    </span>
                  </div>

                  <span style={styles.timestamp} className="tabular-nums">
                    {formatTime(log.created_at)}
                  </span>
                </div>

                <p style={styles.reasonText}>{log.reason ?? 'AST verification event'}</p>

                <div style={styles.cardFooter}>
                  <div style={styles.idGroup}>
                    <span style={styles.idLabel}>Audit:</span>
                    <code style={styles.idValue} className="tabular-nums">
                      {log.id.slice(0, 8)}
                    </code>
                  </div>

                  {log.query_id && (
                    <div style={styles.idGroup}>
                      <span style={styles.idLabel}>Query:</span>
                      <code style={styles.idValue} className="tabular-nums">
                        {log.query_id.slice(0, 8)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    height: '100%',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: 8,
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '5px 24px 5px 26px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  summaryBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 10px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
  },
  summaryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  summaryTitle: {
    fontSize: '0.73rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  summaryBadge: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  loadingWrapper: {
    padding: '8px 0',
  },
  errorBox: {
    padding: 10,
    backgroundColor: 'var(--accent-danger-subtle)',
    border: '1px solid var(--accent-danger-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent-danger)',
    fontSize: '0.75rem',
  },
  retryBtn: {
    marginTop: 6,
    padding: '3px 8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--accent-danger)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent-danger)',
    cursor: 'pointer',
  },
  empty: {
    padding: '28px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    maxHeight: 380,
  },
  logCard: {
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  statusLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
  },
  timestamp: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  reasonText: {
    margin: 0,
    fontSize: '0.74rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    fontSize: '0.68rem',
  },
  idGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  idLabel: {
    color: 'var(--text-muted)',
  },
  idValue: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-surface)',
    padding: '1px 4px',
    borderRadius: 3,
  },
}
