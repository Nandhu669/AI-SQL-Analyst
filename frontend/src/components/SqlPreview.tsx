/**
 * SqlPreview.tsx — Interactive SQL Preview & Sandbox Editor.
 *
 * Allows viewing syntax-highlighted SQL or switching to "Sandbox Mode"
 * to edit and execute custom SQL against Supabase with real telemetry logging.
 */

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { QueryResult } from '../types/query'

interface SqlPreviewProps {
  result: QueryResult
  onRunCustomSql?: (customSql: string) => void
  running?: boolean
}

export function SqlPreview({ result, onRunCustomSql, running }: SqlPreviewProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [customSql, setCustomSql] = useState(result.sql)

  useEffect(() => {
    setCustomSql(result.sql)
  }, [result.sql])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(isEditing ? customSql : result.sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = () => {
    if (!customSql.trim() || running || !onRunCustomSql) return
    onRunCustomSql(customSql)
  }

  return (
    <div style={styles.container}>
      {/* Header row */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.toggle} onClick={() => setIsOpen((o) => !o)}>
            <span style={styles.toggleIcon}>{isOpen ? '▼' : '▶'}</span>
            <span style={styles.toggleLabel}>
              {isEditing ? '🛠️ SQL Sandbox Editor' : 'Generated SQL'}
            </span>
          </button>
          {result.queryId && (
            <span style={styles.idBadge} title={`Logged in Supabase ID: ${result.queryId}`}>
              ID: {result.queryId.slice(0, 8)}...
            </span>
          )}
        </div>

        <div style={styles.meta}>
          <span style={styles.badge}>⚡ {result.executionTimeMs}ms</span>
          <span style={styles.badge}>📄 {result.rowCount} rows</span>

          <button
            style={{
              ...styles.modeBtn,
              background: isEditing ? '#eff6ff' : '#f8fafc',
              borderColor: isEditing ? '#3b82f6' : '#d1d5db',
              color: isEditing ? '#1d4ed8' : '#374151',
            }}
            onClick={() => setIsEditing((prev) => !prev)}
            title="Toggle between highlighted preview and live editable SQL sandbox"
          >
            {isEditing ? '👁️ View Highlighted' : '✏️ Edit Sandbox'}
          </button>

          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Body content */}
      {isOpen && (
        <div>
          {isEditing ? (
            <div style={styles.editorWrapper}>
              <textarea
                style={styles.textarea}
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                rows={6}
                placeholder="Enter a SELECT statement..."
                disabled={running}
              />
              <div style={styles.editorFooter}>
                <span style={styles.hintText}>
                  💡 Sandbox rules: Read-only SELECT queries only. Dangerous mutations are blocked.
                </span>
                <button
                  style={{
                    ...styles.runBtn,
                    opacity: running || !customSql.trim() ? 0.6 : 1,
                    cursor: running || !customSql.trim() ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleRun}
                  disabled={running || !customSql.trim()}
                >
                  {running ? '⏳ Executing...' : '▶️ Run SQL'}
                </button>
              </div>
            </div>
          ) : (
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
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
  idBadge: {
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    color: '#6b7280',
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
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
  modeBtn: {
    fontSize: '0.78rem',
    padding: '2px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 20,
    fontWeight: 600,
    cursor: 'pointer',
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
  editorWrapper: {
    padding: 12,
    background: '#1e1e1e',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#252526',
    color: '#d4d4d4',
    border: '1px solid #3c3c3c',
    borderRadius: 6,
    padding: 10,
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
  },
  editorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  hintText: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  runBtn: {
    fontSize: '0.8rem',
    fontWeight: 600,
    padding: '6px 14px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
  },
}
