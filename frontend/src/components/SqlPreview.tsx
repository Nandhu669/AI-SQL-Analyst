/**
 * SqlPreview.tsx — Displays the generated SQL with syntax highlighting.
 *
 * Shows:
 *  - The SQL query in a readable, highlighted code block
 *  - Execution time badge
 *  - Row count badge
 *  - Copy-to-clipboard button
 *  - Collapsible panel (open by default)
 *
 * Day 3: receives mock SQL from MOCK_RESULT.sql
 * Day 4: receives real SQL from POST /api/v1/mcp/query response
 */

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { QueryResult } from '../types/query'

interface SqlPreviewProps {
  result: QueryResult
}

export function SqlPreview({ result }: SqlPreviewProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.container}>
      {/* Header row */}
      <div style={styles.header}>
        <button style={styles.toggle} onClick={() => setIsOpen((o) => !o)}>
          <span style={styles.toggleIcon}>{isOpen ? '▼' : '▶'}</span>
          <span style={styles.toggleLabel}>Generated SQL</span>
        </button>

        <div style={styles.meta}>
          <span style={styles.badge}>⚡ {result.executionTimeMs}ms</span>
          <span style={styles.badge}>📄 {result.rowCount} rows</span>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* SQL code block */}
      {isOpen && (
        <div style={styles.codeWrapper}>
          <SyntaxHighlighter
            language="sql"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0 0 8px 8px',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            {result.sql}
          </SyntaxHighlighter>
        </div>
      )}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  toggleIcon: {
    fontSize: '0.65rem',
    color: '#6b7280',
  },
  toggleLabel: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
  },
  meta: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '0.78rem',
    padding: '2px 10px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    color: '#475569',
    fontWeight: 500,
  },
  copyBtn: {
    fontSize: '0.78rem',
    padding: '2px 10px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 20,
    color: '#2563eb',
    fontWeight: 600,
    cursor: 'pointer',
  },
  codeWrapper: {
    overflow: 'auto',
  },
}
