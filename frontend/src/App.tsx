/**
 * App.tsx — Main layout and query lifecycle orchestrator.
 *
 * Day 3 responsibilities:
 *  1. Render the page header with status badges
 *  2. Render the query input box
 *  3. On submit → call simulateQuery() with a 1.5s fake delay
 *  4. On success → show SQL preview, chart, and results table
 *  5. On error → show an error state
 *
 * Day 4 change:
 *  Replace simulateQuery() with a real fetch() to POST /api/v1/mcp/query
 *  Everything else stays the same.
 */

import { useState } from 'react'
import { StatusBar } from './components/StatusBar'
import { QueryInput } from './components/QueryInput'
import { SqlPreview } from './components/SqlPreview'
import { ResultsChart } from './components/ResultsChart'
import { ResultsTable } from './components/ResultsTable'
import { generateQuery, executeQuery } from './api/mcp'
import type { QueryResult, QueryStatus } from './types/query'

function App() {
  const [status, setStatus] = useState<QueryStatus>('idle')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [lastQuestion, setLastQuestion] = useState<string>('')

  // ── Query handler ───────────────────────────────────────────────────────────
  // Day 4: two real API calls — generate SQL, then execute it
  // Day 5: /execute returns real Supabase rows
  // Day 7: /query returns real LLM-generated SQL
  const handleQuery = async (question: string) => {
    setStatus('loading')
    setResult(null)
    setErrorMsg('')
    setLastQuestion(question)

    try {
      // Step 1: generate SQL from the user's question
      const { sql } = await generateQuery(question)

      // Step 2: execute the generated SQL
      const execResult = await executeQuery(sql)

      // Step 3: map backend snake_case to frontend camelCase
      const data: QueryResult = {
        sql,
        columns: execResult.columns,
        rows: execResult.rows,
        executionTimeMs: execResult.execution_time_ms,
        rowCount: execResult.row_count,
      }

      setResult(data)
      setStatus('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🤖 AI SQL Analyst</h1>
          <span style={styles.phase}>Phase 1 · Day 4</span>
        </div>
        <StatusBar />
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={styles.main}>

        {/* Query input */}
        <section style={styles.card}>
          <QueryInput onSubmit={handleQuery} status={status} />
        </section>

        {/* Loading state */}
        {status === 'loading' && (
          <div style={styles.loadingBanner}>
            <span style={styles.spinner}>⏳</span>
            <div>
              <div style={styles.loadingTitle}>Analyzing your question…</div>
              <div style={styles.loadingSubtitle}>
                "{lastQuestion}"
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={styles.errorBanner}>
            <strong>❌ Something went wrong</strong>
            <p style={styles.errorText}>{errorMsg}</p>
          </div>
        )}

        {/* Results — shown only after a successful query */}
        {status === 'success' && result && (
          <>
            {/* SQL preview */}
            <section>
              <SqlPreview result={result} />
            </section>

            {/* Chart */}
            <section>
              <ResultsChart result={result} />
            </section>

            {/* Table */}
            <section>
              <ResultsTable result={result} />
            </section>
          </>
        )}

        {/* Idle state hint */}
        {status === 'idle' && (
          <div style={styles.idleHint}>
            <div style={styles.idleIcon}>💬</div>
            <p style={styles.idleText}>
              Type a question above and click <strong>Analyze</strong> to see the
              generated SQL, chart, and data table.
            </p>
            <p style={styles.idleNote}>
              Day 3 uses mock data — real AI + database comes in Days 4–8.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 860,
    margin: '0 auto',
    padding: '0 20px 60px',
    color: '#1a1a1a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0 16px',
    borderBottom: '1px solid #f3f4f6',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  phase: {
    background: '#eff6ff',
    color: '#2563eb',
    borderRadius: 20,
    padding: '3px 12px',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 20,
    background: '#fff',
  },
  loadingBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 20px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 10,
  },
  spinner: {
    fontSize: '1.5rem',
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    fontWeight: 600,
    color: '#92400e',
    fontSize: '0.9rem',
  },
  loadingSubtitle: {
    color: '#b45309',
    fontSize: '0.82rem',
    marginTop: 2,
    fontStyle: 'italic',
  },
  errorBanner: {
    padding: '16px 20px',
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: 10,
    color: '#991b1b',
  },
  errorText: {
    margin: '6px 0 0',
    fontSize: '0.875rem',
  },
  idleHint: {
    padding: '40px 20px',
    textAlign: 'center',
    border: '1.5px dashed #e5e7eb',
    borderRadius: 10,
    background: '#fafafa',
  },
  idleIcon: {
    fontSize: '2.5rem',
    marginBottom: 12,
  },
  idleText: {
    color: '#374151',
    margin: '0 0 8px',
    lineHeight: 1.6,
  },
  idleNote: {
    color: '#9ca3af',
    fontSize: '0.82rem',
    margin: 0,
  },
}
