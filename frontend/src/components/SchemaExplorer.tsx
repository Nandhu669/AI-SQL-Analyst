/**
 * SchemaExplorer.tsx — Interactive Database Schema Navigator.
 *
 * Impeccable Craft Standards:
 *  - High-density information display suited for data operators
 *  - Real Supabase schema inspection (`orders`, `customers`, `mcp_queries`)
 *  - 1-click chip insertion into the Natural Language query prompt
 *  - Quick starter templates for immediate data inspection
 */

import { useState, useEffect } from 'react'
import {
  Database,
  Table2,
  Columns3,
  Search,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Copy,
  Check,
  Play,
  Layers,
} from 'lucide-react'
import { fetchSchema, type SchemaResponse, type SchemaTable } from '../api/mcp'

interface SchemaExplorerProps {
  onInsertText: (text: string) => void
  onRunTemplate: (sql: string, prompt: string) => void
}

const TEMPLATES = [
  {
    label: 'Top 10 Orders',
    prompt: 'Show me the 10 most recent orders with product names and amounts',
    sql: 'SELECT id, product_name, amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10;',
  },
  {
    label: 'Revenue by Product',
    prompt: 'What is the total revenue and order count for each product?',
    sql: 'SELECT product_name, SUM(amount) AS total_revenue, COUNT(*) AS order_count FROM orders GROUP BY product_name ORDER BY total_revenue DESC;',
  },
  {
    label: 'Customers by Region',
    prompt: 'How many customers do we have in each region?',
    sql: 'SELECT region, COUNT(*) AS customer_count FROM customers GROUP BY region ORDER BY customer_count DESC;',
  },
  {
    label: 'Order Status Counts',
    prompt: 'Show the distribution of order statuses and total value',
    sql: 'SELECT status, COUNT(*) AS total_orders, ROUND(SUM(amount), 2) AS total_amount FROM orders GROUP BY status ORDER BY total_orders DESC;',
  },
]

export function SchemaExplorer({ onInsertText, onRunTemplate }: SchemaExplorerProps) {
  const [schema, setSchema] = useState<SchemaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    orders: true,
    customers: true,
  })
  const [copiedItem, setCopiedItem] = useState<string>('')

  const loadSchema = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSchema()
      setSchema(data)
      // Default expand all
      const expanded: Record<string, boolean> = {}
      data.tables.forEach((t) => {
        expanded[t.table_name] = true
      })
      setExpandedTables(expanded)
    } catch (err) {
      setError('Unable to load database schema')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchema()
  }, [])

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedItem(text)
    setTimeout(() => setCopiedItem(''), 1500)
  }

  const filteredTables = schema?.tables.filter((tbl) => {
    if (!search.trim()) return true
    const term = search.toLowerCase()
    const matchesTable = tbl.table_name.toLowerCase().includes(term)
    const matchesCol = tbl.columns.some((c) => c.name.toLowerCase().includes(term) || c.type.toLowerCase().includes(term))
    return matchesTable || matchesCol
  })

  return (
    <div style={styles.container}>
      {/* Search Header */}
      <div style={styles.searchBox}>
        <Search size={14} style={styles.searchIcon} aria-hidden="true" />
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Filter tables & columns…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Filter tables and columns"
        />
        {search && (
          <button style={styles.clearSearchBtn} onClick={() => setSearch('')} aria-label="Clear filter">
            ×
          </button>
        )}
      </div>

      {/* Quick Templates Section */}
      <div style={styles.templateSection}>
        <div style={styles.sectionHeader}>
          <Layers size={13} style={{ color: 'var(--accent-primary)' }} />
          <span>Quick Starters</span>
        </div>
        <div style={styles.templateGrid}>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              style={styles.templateBtn}
              onClick={() => onRunTemplate(tmpl.sql, tmpl.prompt)}
              title={tmpl.prompt}
            >
              <Play size={10} style={{ color: 'var(--accent-success)' }} />
              <span style={styles.templateLabel}>{tmpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tables & Columns List */}
      <div style={styles.tableListSection}>
        <div style={styles.sectionHeader}>
          <Database size={13} style={{ color: 'var(--accent-info)' }} />
          <span>PostgreSQL Tables</span>
          <span style={styles.tableCountBadge}>{filteredTables?.length ?? 0}</span>
        </div>

        {loading && (
          <div style={styles.loadingState}>
            <div className="skeleton-loading" style={{ height: 38, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
            <div className="skeleton-loading" style={{ height: 38, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
            <div className="skeleton-loading" style={{ height: 38, borderRadius: 'var(--radius-sm)' }} />
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <p>{error}</p>
            <button style={styles.retryBtn} onClick={loadSchema}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredTables && (
          <div style={styles.tablesContainer}>
            {filteredTables.map((tbl: SchemaTable) => {
              const isExpanded = !!expandedTables[tbl.table_name]
              return (
                <div key={tbl.table_name} style={styles.tableCard}>
                  {/* Table Header Bar */}
                  <div style={styles.tableHeader} onClick={() => toggleTable(tbl.table_name)}>
                    <div style={styles.tableHeaderLeft}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Table2 size={14} style={{ color: 'var(--accent-primary)' }} />
                      <strong style={styles.tableName}>{tbl.table_name}</strong>
                    </div>

                    <div style={styles.tableHeaderActions}>
                      <button
                        style={styles.actionChip}
                        onClick={(e) => {
                          e.stopPropagation()
                          onInsertText(tbl.table_name)
                        }}
                        title={`Insert "${tbl.table_name}" into prompt`}
                      >
                        <PlusCircle size={11} />
                        <span>Insert</span>
                      </button>

                      <button
                        style={styles.iconChip}
                        onClick={(e) => handleCopy(tbl.table_name, e)}
                        title="Copy table name"
                      >
                        {copiedItem === tbl.table_name ? <Check size={11} color="var(--accent-success)" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  {/* Columns List */}
                  {isExpanded && (
                    <div style={styles.columnsList}>
                      {tbl.columns.map((col) => (
                        <div key={col.name} style={styles.columnRow}>
                          <div style={styles.colInfo}>
                            <Columns3 size={11} style={styles.colIcon} />
                            <span style={styles.colName}>{col.name}</span>
                          </div>

                          <div style={styles.colMeta}>
                            <span style={styles.colType}>{col.type}</span>
                            <button
                              style={styles.insertColBtn}
                              onClick={() => onInsertText(col.name)}
                              title={`Insert "${col.name}" into prompt`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    height: '100%',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '7px 28px 7px 32px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 8,
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  templateSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingBottom: 12,
    borderBottom: '1px solid var(--border-subtle)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--text-secondary)',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 6,
  },
  templateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.72rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  templateLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tableListSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
    overflowY: 'auto',
  },
  tableCountBadge: {
    marginLeft: 'auto',
    fontSize: '0.68rem',
    padding: '1px 6px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-muted)',
  },
  tablesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  tableCard: {
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-surface)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  tableHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--text-primary)',
  },
  tableName: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
  },
  tableHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  actionChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 6px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },
  iconChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  columnsList: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 0',
    backgroundColor: 'var(--bg-canvas)',
  },
  columnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 10px 4px 24px',
    fontSize: '0.72rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  colInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--text-secondary)',
  },
  colIcon: {
    color: 'var(--text-muted)',
  },
  colName: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
  },
  colMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  colType: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    padding: '1px 4px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 3,
  },
  insertColBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    padding: 0,
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 3,
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  loadingState: {
    padding: '10px 0',
  },
  errorBox: {
    padding: 12,
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
}
