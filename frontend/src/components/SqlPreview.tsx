/**
 * SqlPreview.tsx — Interactive SQL Preview & Live Sandbox Editor.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Dual mode: syntax-highlighted display vs live editable sandbox
 *  - AST safety status pill ("Verified Read-Only SELECT")
 *  - Real execution telemetry badges (tabular numerals)
 *  - Copy to clipboard with visual feedback
 */

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Play,
  ShieldCheck,
  Clock,
  Rows3,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Database,
} from 'lucide-react'
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

  const handleReset = () => {
    setCustomSql(result.sql)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }

  return (
    <div style={styles.card}>
      {/* Header Bar */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.toggleBtn} onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span style={styles.titleIcon}>
              {isEditing ? <Terminal size={14} style={{ color: 'var(--accent-primary)' }} /> : <Code2 size={14} style={{ color: 'var(--accent-info)' }} />}
            </span>
            <span style={styles.titleText}>
              {isEditing ? 'Interactive SQL Sandbox' : 'Generated PostgreSQL Query'}
            </span>
          </button>

          {/* AST Safety Verification Pill */}
          <div style={styles.safetyPill} title="Validated by AST parser (sqlglot). Mutations permanently blocked.">
            <ShieldCheck size={12} style={{ color: 'var(--accent-success)' }} />
            <span>Read-Only Verified</span>
          </div>
        </div>

        {/* Telemetry & Controls */}
        <div style={styles.metaGroup}>
          {result.executionTimeMs != null && (
            <div style={styles.metaBadge} title="Execution latency">
              <Clock size={11} />
              <span className="tabular-nums">{result.executionTimeMs}ms</span>
            </div>
          )}

          {result.rowCount != null && (
            <div style={styles.metaBadge} title="Returned rows">
              <Rows3 size={11} />
              <span className="tabular-nums">{result.rowCount} rows</span>
            </div>
          )}

          {result.queryId && (
            <div style={styles.metaBadge} title={`Supabase Audit ID: ${result.queryId}`}>
              <Database size={11} />
              <span>{result.queryId.slice(0, 8)}</span>
            </div>
          )}

          <div style={styles.modeToggleGroup}>
            <button
              style={{
                ...styles.modeTab,
                backgroundColor: !isEditing ? 'var(--accent-primary-subtle)' : 'transparent',
                borderColor: !isEditing ? 'var(--accent-primary-border)' : 'var(--border-default)',
                color: !isEditing ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setIsEditing(false)}
            >
              Preview
            </button>
            <button
              style={{
                ...styles.modeTab,
                backgroundColor: isEditing ? 'var(--accent-primary-subtle)' : 'transparent',
                borderColor: isEditing ? 'var(--accent-primary-border)' : 'var(--border-default)',
                color: isEditing ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setIsEditing(true)}
            >
              Sandbox
            </button>
          </div>

          <button style={styles.copyBtn} onClick={handleCopy} title="Copy SQL statement">
            {copied ? <Check size={12} style={{ color: 'var(--accent-success)' }} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Body Area */}
      {isOpen && (
        <div style={styles.body}>
          {isEditing ? (
            <div style={styles.editorWrapper}>
              <div style={styles.editorToolbar}>
                <span style={styles.editorHint}>
                  Edit and execute directly against Supabase. Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run.
                </span>

                <button style={styles.resetBtn} onClick={handleReset} title="Reset to original generated SQL">
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>

              <textarea
                style={styles.editorTextarea}
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={6}
                placeholder="Enter a SELECT statement..."
                disabled={running}
                spellCheck={false}
              />

              <div style={styles.editorFooter}>
                <span style={styles.securityNotice}>
                  Protected by PostgreSQL execution sandbox. Only SELECT operations are allowed.
                </span>

                <button
                  style={{
                    ...styles.runCustomBtn,
                    opacity: running || !customSql.trim() ? 0.6 : 1,
                  }}
                  onClick={handleRun}
                  disabled={running || !customSql.trim()}
                >
                  <Play size={12} />
                  <span>{running ? 'Executing…' : 'Run Sandbox SQL'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.highlightWrapper}>
              <SyntaxHighlighter
                language="sql"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-canvas)',
                  fontSize: '0.82rem',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid var(--border-subtle)',
                }}
                showLineNumbers
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
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
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
  titleIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  titleText: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  safetyPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 7px',
    backgroundColor: 'var(--accent-success-subtle)',
    border: '1px solid var(--accent-success-border)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.68rem',
    fontWeight: 600,
    color: 'var(--accent-success)',
  },
  metaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 7px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  modeToggleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'var(--bg-canvas)',
    padding: 2,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-subtle)',
  },
  modeTab: {
    padding: '3px 8px',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  body: {
    padding: 12,
  },
  highlightWrapper: {
    overflowX: 'auto',
  },
  editorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  editorToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorHint: {
    fontSize: '0.73rem',
    color: 'var(--text-muted)',
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 6px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  editorTextarea: {
    width: '100%',
    padding: 12,
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.82rem',
    lineHeight: '1.6',
    resize: 'vertical',
  },
  editorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  securityNotice: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  runCustomBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
