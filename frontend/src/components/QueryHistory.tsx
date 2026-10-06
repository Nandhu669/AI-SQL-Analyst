/**
 * QueryHistory.tsx — Persistent Query History & Audit Trail Panel.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Real Supabase database history (`mcp_queries` table)
 *  - Search filter across historical prompts & SQL
 *  - 1-click query restoration into the active sandbox
 *  - Tabular numerals for latencies and timestamps
 */

import { useState, useMemo } from 'react'
import {
  History,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  Rows3,
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react'
import type { QueryHistoryItem } from '../types/query'

interface QueryHistoryProps {
  history: QueryHistoryItem[]
  loading: boolean
  onSelectQuery: (item: QueryHistoryItem) => void
  onRefresh: () => void
}

export function QueryHistory({ history, loading, onSelectQuery, onRefresh }: QueryHistoryProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return isoString
    }
  }

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history
    const term = searchTerm.toLowerCase()
    return history.filter(
      (item) =>
        item.user_prompt.toLowerCase().includes(term) ||
        (item.generated_query && item.generated_query.toLowerCase().includes(term))
    )
  }, [history, searchTerm])

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.toggleBtn} onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <History size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={styles.titleText}>Saved Query History</span>
          </button>
          <span style={styles.countBadge} className="tabular-nums">
            {history.length}
          </span>
        </div>

        <div style={styles.headerRight}>
          <button
            style={styles.refreshBtn}
            onClick={onRefresh}
            disabled={loading}
            title="Refresh history from Supabase"
          >
            <RefreshCw size={12} className={loading ? 'spin-anim' : ''} />
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div style={styles.body}>
          {/* Search Bar */}
          {history.length > 0 && (
            <div style={styles.searchBox}>
              <Search size={12} style={styles.searchIcon} />
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Filter saved queries…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Filter query history"
              />
              {searchTerm && (
                <button style={styles.clearBtn} onClick={() => setSearchTerm('')}>
                  ×
                </button>
              )}
            </div>
          )}

          {/* List */}
          {history.length === 0 ? (
            <div style={styles.empty}>
              <Database size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
              <p style={styles.emptyText}>No queries recorded yet in Supabase.</p>
              <span style={styles.emptySubtext}>Run an analysis to record persistent execution logs.</span>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredHistory.map((item) => {
                const isSuccess = item.status === 'success'
                return (
                  <div
                    key={item.id}
                    style={styles.itemCard}
                    onClick={() => onSelectQuery(item)}
                    title="Click to reload this query into the active sandbox"
                  >
                    <div style={styles.itemTop}>
                      <span style={styles.itemPrompt}>{item.user_prompt}</span>
                      <div
                        style={{
                          ...styles.statusPill,
                          backgroundColor: isSuccess ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
                          borderColor: isSuccess ? 'var(--accent-success-border)' : 'var(--accent-danger-border)',
                          color: isSuccess ? 'var(--accent-success)' : 'var(--accent-danger)',
                        }}
                      >
                        {isSuccess ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        <span>{isSuccess ? 'Success' : 'Error'}</span>
                      </div>
                    </div>

                    {item.generated_query && (
                      <code style={styles.sqlSnippet}>
                        {item.generated_query.replace(/\s+/g, ' ').slice(0, 80)}…
                      </code>
                    )}

                    <div style={styles.itemFooter}>
                      <div style={styles.metaGroup}>
                        {item.execution_time != null && (
                          <div style={styles.metaPill}>
                            <Clock size={10} />
                            <span className="tabular-nums">{item.execution_time}ms</span>
                          </div>
                        )}
                        {item.row_count != null && (
                          <div style={styles.metaPill}>
                            <Rows3 size={10} />
                            <span className="tabular-nums">{item.row_count} rows</span>
                          </div>
                        )}
                      </div>

                      <div style={styles.footerRight}>
                        <span style={styles.timestamp} className="tabular-nums">
                          {formatTime(item.created_at)}
                        </span>
                        <div style={styles.reloadHint}>
                          <Play size={9} />
                          <span>Load</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-surface-elevated)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: 0,
  },
  titleText: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  countBadge: {
    padding: '1px 6px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.68rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  body: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 380,
    overflowY: 'auto',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
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
  empty: {
    padding: '24px 16px',
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
  },
  itemCard: {
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    transition: 'all 0.15s ease',
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemPrompt: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 6px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    fontSize: '0.65rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  sqlSnippet: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-surface)',
    padding: '4px 6px',
    borderRadius: 3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  metaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  metaPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  reloadHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: '0.68rem',
    color: 'var(--accent-primary)',
    fontWeight: 600,
  },
}
