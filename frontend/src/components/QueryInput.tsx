/**
 * QueryInput.tsx — Natural language input box.
 *
 * The user types a question in plain English here.
 * On submit, the parent component (App.tsx) handles the query lifecycle.
 *
 * Day 4: onSubmit will trigger the real POST /api/v1/mcp/query call.
 * Day 3: onSubmit triggers the mock simulation.
 */

import type { QueryStatus } from '../types/query'

interface QueryInputProps {
  onSubmit: (question: string) => void
  status: QueryStatus
}

const MAX_CHARS = 500

const EXAMPLE_QUESTIONS = [
  'Show me total sales by product for the last 30 days',
  'Which customers placed more than 5 orders this month?',
  'What is the average order value by region?',
]

export function QueryInput({ onSubmit, status }: QueryInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = () => {
    const trimmed = question.trim()
    if (!trimmed || status === 'loading') return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  const isLoading = status === 'loading'

  return (
    <div style={styles.container}>
      <label style={styles.label} htmlFor="nl-input">
        Ask a question about your data
      </label>

      <textarea
        id="nl-input"
        style={styles.textarea}
        value={question}
        onChange={(e) => setQuestion(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={EXAMPLE_QUESTIONS[0]}
        rows={3}
        disabled={isLoading}
      />

      <div style={styles.footer}>
        <div style={styles.hints}>
          <span style={styles.charCount}>
            {question.length}/{MAX_CHARS}
          </span>
          <span style={styles.hint}>Ctrl+Enter to submit</span>
        </div>

        <button
          style={{
            ...styles.button,
            opacity: isLoading || !question.trim() ? 0.65 : 1,
            cursor: isLoading || !question.trim() ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? '⏳ Analyzing…' : '🔍 Analyze'}
        </button>
      </div>

      {/* Example questions */}
      <div style={styles.examples}>
        <span style={styles.examplesLabel}>Try:</span>
        {EXAMPLE_QUESTIONS.slice(1).map((q) => (
          <button
            key={q}
            style={styles.exampleChip}
            onClick={() => setQuestion(q)}
            disabled={isLoading}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Need useState in scope ────────────────────────────────────────────────────
import { useState } from 'react'

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#111827',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '0.95rem',
    border: '1.5px solid #d1d5db',
    borderRadius: 8,
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1f2937',
    background: '#fff',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hints: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  charCount: {
    fontSize: '0.78rem',
    color: '#9ca3af',
  },
  hint: {
    fontSize: '0.78rem',
    color: '#9ca3af',
  },
  button: {
    padding: '10px 24px',
    fontSize: '0.95rem',
    fontWeight: 600,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    transition: 'opacity 0.15s',
  },
  examples: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  examplesLabel: {
    fontSize: '0.78rem',
    color: '#6b7280',
    fontWeight: 600,
  },
  exampleChip: {
    fontSize: '0.75rem',
    padding: '3px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    background: '#f9fafb',
    color: '#374151',
    cursor: 'pointer',
  },
}
