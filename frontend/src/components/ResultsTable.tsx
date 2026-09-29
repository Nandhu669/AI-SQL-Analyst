/**
 * ResultsTable.tsx — Displays query results as a readable data table.
 *
 * - Columns are driven by QueryResult.columns (dynamic — works for any query)
 * - Rows are driven by QueryResult.rows
 * - Horizontal scroll for wide result sets
 * - Alternating row colours for readability
 *
 * Day 3: receives mock rows
 * Day 4: receives real rows from POST /api/v1/mcp/execute response
 */

import type { QueryResult } from '../types/query'

interface ResultsTableProps {
  result: QueryResult
}

export function ResultsTable({ result }: ResultsTableProps) {
  const { columns, rows, rowCount } = result

  if (rows.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No rows returned.</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Results</span>
        <span style={styles.count}>{rowCount} row{rowCount !== 1 ? 's' : ''}</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={styles.th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? '#fff' : '#f8fafc',
                }}
              >
                {columns.map((col) => (
                  <td key={col} style={styles.td}>
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  title: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
  },
  count: {
    fontSize: '0.78rem',
    color: '#6b7280',
    background: '#f1f5f9',
    padding: '2px 10px',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#374151',
    background: '#f1f5f9',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 14px',
    color: '#1f2937',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#9ca3af',
  },
}
