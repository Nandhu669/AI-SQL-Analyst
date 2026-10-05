/**
 * QueryHistory.tsx — Persistent Query History Panel.
 *
 * Fetches and displays execution logs from Supabase `mcp_queries` table.
 * Allows clicking on past queries to restore and re-run them.
 */

import { useState } from 'react'
import type { QueryHistoryItem } from '../types/query'

interface QueryHistoryProps {
  history: QueryHistoryItem[]
  loading: boolean
  onSelectQuery: (item: QueryHistoryItem) => void
  onRefresh: () => void
}

export function QueryHistory({ history, loading, onSelectQuery, onRefresh }: QueryHistoryProps) {
  const [isOpen, setIsOpen] = useState(true)

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return isoString
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.toggle} onClick={() => setIsOpen((prev) => !prev)}>
          <span style={styles.icon}>{isOpen ? '▼' : '▶'}</span>
          <span style={styles.title}>📜 Saved Query History</span>
          <span style={styles.countBadge}>{history.length}</span>
        </button>

        <div style={styles.actions}>
          <button style={styles.refreshBtn} onClick={onRefresh} disabled={loading}>
            {loading ? '⏳' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={styles.content}>
          {history.length === 0 ? (
            <div style={styles.empty}>
              <p>No queries recorded yet in Supabase. Run a query to start tracking history!</p>
            </div>
          ) : (
            <div style={styles.list}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={styles.card}
                  onClick={() => onSelectQuery(item)}
                  title="Click to reload this query into the sandbox"
                >
                  <div style={styles.cardTop}>
                    <span style={styles.promptText}>{item.user_prompt}</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: item.status === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: item.status === 'success' ? '#16a34a' : '#dc2626',
                        border: `1px solid ${item.status === 'success' ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      {item.status === 'success' ? '● Success' : '● Error'}
                    </span>
                  </div>

                  {item.generated_query && (
                    <code style={styles.sqlSnippet}>
                      {item.generated_query.split('\n')[0].slice(0, 70)}...
                    </code>
                  )}

                  <div style={styles.cardFooter}>
                    <div style={styles.metaGroup}>
                      {item.execution_time != null && (
                        <span style={styles.metaBadge}>⚡ {item.execution_time}ms</span>
                      )}
                      {item.row_count != null && (
                        <span style={styles.metaBadge}>📄 {item.row_count} rows</span>
                      )}
                    </div>
                    <span style={styles.timeText}>{formatTime(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  icon: {
    fontSize: '0.65rem',
    color: '#6b7280',
  },
  title: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
  },
  countBadge: {
    fontSize: '0.72rem',
    padding: '1px 7px',
    background: '#e0e7ff',
    color: '#4338ca',
    borderRadius: 12,
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: 6,
  },
  refreshBtn: {
    fontSize: '0.78rem',
    padding: '3px 10px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 500,
  },
  content: {
    maxHeight: 280,
    overflowY: 'auto',
    padding: 10,
    background: '#fafafa',
  },
  empty: {
    padding: '20px 10px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.85rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    padding: '10px 12px',
    borderRadius: 6,
    background: '#fff',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  promptText: {
    fontWeight: 600,
    fontSize: '0.85rem',
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '75%',
  },
  statusBadge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 600,
  },
  sqlSnippet: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: 4,
    margin: '6px 0',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metaGroup: {
    display: 'flex',
    gap: 6,
  },
  metaBadge: {
    fontSize: '0.72rem',
    color: '#4b5563',
    background: '#f1f5f9',
    padding: '1px 6px',
    borderRadius: 4,
  },
  timeText: {
    fontSize: '0.72rem',
    color: '#9ca3af',
  },
}
