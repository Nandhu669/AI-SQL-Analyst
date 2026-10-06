/**
 * QueryInput.tsx — Command-bar styled Natural Language query input.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Keyboard shortcuts (Ctrl+Enter / Cmd+Enter)
 *  - Structured prompt suggestion chips for fast operator discovery
 *  - Tabular character counting and accessible labels
 */

import { useState } from 'react'
import { Sparkles, Send, CornerDownLeft, X, Bot, Compass } from 'lucide-react'
import type { QueryStatus } from '../types/query'

interface QueryInputProps {
  onSubmit: (question: string) => void
  status: QueryStatus
  initialValue?: string
}

const MAX_CHARS = 500

const SUGGESTIONS = [
  { label: 'Top 5 Products', prompt: 'Show the top 5 products by total sales revenue' },
  { label: 'Average Order Value', prompt: 'What is the average order amount per product?' },
  { label: 'Min Sale Product', prompt: 'Which product had the minimum sale amount?' },
  { label: 'Completed Orders', prompt: 'How many completed orders do we have by product?' },
  { label: 'Regional Customers', prompt: 'Count total customers grouped by region' },
]

export function QueryInput({ onSubmit, status, initialValue = '' }: QueryInputProps) {
  const [question, setQuestion] = useState(initialValue)

  const handleSubmit = () => {
    const trimmed = question.trim()
    if (!trimmed || status === 'loading') return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChipClick = (promptText: string) => {
    setQuestion(promptText)
  }

  const handleClear = () => {
    setQuestion('')
  }

  const isLoading = status === 'loading'

  return (
    <div style={styles.card}>
      {/* Top Bar / Meta */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.sparkleIconWrapper}>
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <span style={styles.title}>Natural Language Query Engine</span>
            <span style={styles.subtitle}>Ask questions in plain English to generate PostgreSQL queries</span>
          </div>
        </div>

        <div style={styles.aiBadge} title="Using OpenRouter free models with automated fallback">
          <Bot size={12} style={{ color: 'var(--accent-success)' }} />
          <span>OpenRouter Free AI</span>
        </div>
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <textarea
          id="nl-query-input"
          style={styles.textarea}
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder="e.g. What is the average sale amount for each product with total orders?"
          rows={3}
          disabled={isLoading}
          aria-label="Natural language query input"
        />

        {question && !isLoading && (
          <button style={styles.clearBtn} onClick={handleClear} title="Clear query" aria-label="Clear input">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Footer Bar: Hints, Char Count, Action Button */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          <div style={styles.shortcutHint}>
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run
          </div>
          <span style={styles.charCount}>
            {question.length}/{MAX_CHARS}
          </span>
        </div>

        <button
          style={{
            ...styles.runBtn,
            opacity: isLoading || !question.trim() ? 0.6 : 1,
            cursor: isLoading || !question.trim() ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          disabled={isLoading || !question.trim()}
          aria-label="Generate and execute query"
        >
          {isLoading ? (
            <>
              <span className="pulsing-dot" style={styles.loadingDot} />
              <span>Generating SQL…</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Run Analysis</span>
              <CornerDownLeft size={12} style={{ opacity: 0.7 }} />
            </>
          )}
        </button>
      </div>

      {/* Prompt Suggestions */}
      <div style={styles.suggestionRow}>
        <div style={styles.suggestionLabel}>
          <Compass size={12} />
          <span>Suggestions:</span>
        </div>
        <div style={styles.chipsWrap}>
          {SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              style={{
                ...styles.chip,
                borderColor: question === item.prompt ? 'var(--accent-primary)' : 'var(--border-subtle)',
                backgroundColor: question === item.prompt ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
              }}
              onClick={() => handleChipClick(item.prompt)}
              disabled={isLoading}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sparkleIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--accent-primary-subtle)',
    border: '1px solid var(--accent-primary-border)',
  },
  title: {
    display: 'block',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
  },
  textarea: {
    width: '100%',
    padding: '10px 36px 10px 12px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1.5,
    resize: 'vertical',
    minHeight: 70,
    transition: 'border-color 0.15s ease',
  },
  clearBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderRadius: 3,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  shortcutHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.73rem',
    color: 'var(--text-muted)',
  },
  charCount: {
    fontSize: '0.73rem',
    color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
  },
  runBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '7px 14px',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
  },
  suggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--border-subtle)',
    flexWrap: 'wrap',
  },
  suggestionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  chipsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    border: '1px solid',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
}
