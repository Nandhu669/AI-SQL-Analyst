/**
 * ResultsTable.tsx — Interactive Data Grid with Sorting, Filtering, Pagination & CSV Export.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Tabular numerals for alignment and readability
 *  - Client-side sorting and row filtering
 *  - 1-click CSV export
 */

import { useState, useMemo } from 'react'
import {
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Check,
} from 'lucide-react'
import type { QueryResult } from '../types/query'

interface ResultsTableProps {
  result: QueryResult
}

type SortOrder = 'asc' | 'desc' | null

export function ResultsTable({ result }: ResultsTableProps) {
  const { columns, rows, rowCount } = result

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [filterText, setFilterText] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false)
  const pageSize = 10

  // ── Sorting & Filtering ─────────────────────────────────────────────────────
  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortOrder === 'asc') setSortOrder('desc')
      else if (sortOrder === 'desc') {
        setSortCol(null)
        setSortOrder(null)
      }
    } else {
      setSortCol(col)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const processedRows = useMemo(() => {
    let items = [...rows]

    // Filter
    if (filterText.trim()) {
      const term = filterText.toLowerCase()
      items = items.filter((row) =>
        columns.some((col) => String(row[col] ?? '').toLowerCase().includes(term))
      )
    }

    // Sort
    if (sortCol && sortOrder) {
      items.sort((a, b) => {
        const valA = a[sortCol]
        const valB = b[sortCol]

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA
        }

        const strA = String(valA ?? '')
        const strB = String(valB ?? '')
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA)
      })
    }

    return items
  }, [rows, columns, filterText, sortCol, sortOrder])

  // Pagination
  const totalPages = Math.ceil(processedRows.length / pageSize) || 1
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return processedRows.slice(start, start + pageSize)
  }, [processedRows, page, pageSize])

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    if (!rows.length) return
    const headerRow = columns.join(',')
    const dataRows = rows.map((r) =>
      columns.map((c) => {
        const val = String(r[c] ?? '')
        return val.includes(',') ? `"${val}"` : val
      }).join(',')
    )
    const csvContent = [headerRow, ...dataRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `query_result_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setCopiedCsv(true)
    setTimeout(() => setCopiedCsv(false), 2000)
  }

  if (rows.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Database size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
        <p style={styles.emptyText}>Query executed successfully, but returned 0 rows.</p>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      {/* Control Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.searchBox}>
            <Search size={12} style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search table rows…"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value)
                setPage(1)
              }}
              aria-label="Filter rows"
            />
          </div>

          <div style={styles.countBadge}>
            <span className="tabular-nums font-semibold">{processedRows.length}</span>
            <span>of {rowCount} rows</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.exportBtn} onClick={handleExportCsv} title="Download results as CSV">
            {copiedCsv ? <Check size={12} style={{ color: 'var(--accent-success)' }} /> : <Download size={12} />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortCol === col
                return (
                  <th key={col} style={styles.th} onClick={() => handleSort(col)}>
                    <div style={styles.thContent}>
                      <span>{col}</span>
                      <span style={styles.sortIconWrapper}>
                        {!isSorted && <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}
                        {isSorted && sortOrder === 'asc' && <ArrowUp size={11} style={{ color: 'var(--accent-primary)' }} />}
                        {isSorted && sortOrder === 'desc' && <ArrowDown size={11} style={{ color: 'var(--accent-primary)' }} />}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, idx) => (
              <tr key={idx} style={styles.tr}>
                {columns.map((col) => {
                  const val = row[col]
                  const isNumber = typeof val === 'number'
                  return (
                    <td
                      key={col}
                      style={{
                        ...styles.td,
                        textAlign: isNumber ? 'right' : 'left',
                      }}
                      className={isNumber ? 'tabular-nums' : ''}
                    >
                      {val != null ? String(val) : <span style={{ color: 'var(--text-muted)' }}>null</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={styles.footer}>
          <span style={styles.pageInfo}>
            Page <span className="tabular-nums font-semibold">{page}</span> of{' '}
            <span className="tabular-nums font-semibold">{totalPages}</span>
          </span>

          <div style={styles.paginationButtons}>
            <button
              style={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              style={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
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
    padding: '8px 12px',
    backgroundColor: 'var(--bg-surface-elevated)',
    borderBottom: '1px solid var(--border-subtle)',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
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
    padding: '4px 8px 4px 26px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
    width: 170,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 8px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
  },
  th: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-canvas)',
    borderBottom: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    userSelect: 'none',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  sortIconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.1s ease',
  },
  td: {
    padding: '8px 12px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: 'var(--bg-canvas)',
    borderTop: '1px solid var(--border-subtle)',
  },
  pageInfo: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    cursor: 'pointer',
  },
  emptyContainer: {
    padding: '36px 16px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
}
