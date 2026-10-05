/**
 * App.tsx — Main layout and query lifecycle orchestrator.
 *
 * Day 6 Responsibilities (Core Product):
 *  1. Persistent query history panel loaded directly from Supabase
 *  2. Interactive SQL sandbox execution for custom queries
 *  3. Seamless reload and re-execution from query history items
 *  4. Production-grade error handling with actionable messages
 */

import { useState, useEffect } from 'react'
import { StatusBar } from './components/StatusBar'
import { QueryInput } from './components/QueryInput'
import { SqlPreview } from './components/SqlPreview'
import { ResultsChart } from './components/ResultsChart'
import { ResultsTable } from './components/ResultsTable'
import { QueryHistory } from './components/QueryHistory'
import { generateQuery, executeQuery, fetchQueryHistory } from './api/mcp'
import type { QueryResult, QueryStatus, QueryHistoryItem } from './types/query'

function App() {
  const [status, setStatus] = useState<QueryStatus>('idle')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [lastQuestion, setLastQuestion] = useState<string>('')
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState<boolean>(false)
  const [sandboxExecuting, setSandboxExecuting] = useState<boolean>(false)

  // ── Load history from Supabase ─────────────────────────────────────────────
  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const items = await fetchQueryHistory()
      setHistory(items)
    } catch {
      // Background fetch failure gracefully handled
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // ── NL Query Handler ────────────────────────────────────────────────────────
  const handleQuery = async (question: string) => {
    setStatus('loading')
    setResult(null)
    setErrorMsg('')
    setLastQuestion(question)

    try {
      // Step 1: generate SQL template for the question
      const { sql } = await generateQuery(question)

      // Step 2: execute SQL against Supabase and log query
      const execResult = await executeQuery(sql, question)

      const data: QueryResult = {
        sql,
        columns: execResult.columns,
        rows: execResult.rows,
        executionTimeMs: execResult.execution_time_ms,
        rowCount: execResult.row_count,
        queryId: execResult.query_id,
        prompt: question,
      }

      setResult(data)
      setStatus('success')
      // Refresh persistent history list
      loadHistory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown query execution error'
      setErrorMsg(msg)
      setStatus('error')
      loadHistory()
    }
  }

  // ── Custom SQL Sandbox Execution ────────────────────────────────────────────
  const handleRunCustomSql = async (customSql: string) => {
    setSandboxExecuting(true)
    setErrorMsg('')

    try {
      const promptLabel = lastQuestion ? `Custom edit: ${lastQuestion}` : 'Sandbox Custom SQL'
      const execResult = await executeQuery(customSql, promptLabel)

      const data: QueryResult = {
        sql: customSql,
        columns: execResult.columns,
        rows: execResult.rows,
        executionTimeMs: execResult.execution_time_ms,
        rowCount: execResult.row_count,
        queryId: execResult.query_id,
        prompt: promptLabel,
      }

      setResult(data)
      setStatus('success')
      loadHistory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Custom SQL execution failed'
      setErrorMsg(msg)
      setStatus('error')
      loadHistory()
    } finally {
      setSandboxExecuting(false)
    }
  }

  // ── Select and Re-run from History ──────────────────────────────────────────
  const handleSelectHistoryQuery = async (item: QueryHistoryItem) => {
    if (!item.generated_query) return
    setStatus('loading')
    setErrorMsg('')
    setLastQuestion(item.user_prompt)

    try {
      const execResult = await executeQuery(item.generated_query, item.user_prompt)

      const data: QueryResult = {
        sql: item.generated_query,
        columns: execResult.columns,
        rows: execResult.rows,
        executionTimeMs: execResult.execution_time_ms,
        rowCount: execResult.row_count,
        queryId: execResult.query_id || item.id,
        prompt: item.user_prompt,
      }

      setResult(data)
      setStatus('success')
      loadHistory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to re-execute history query'
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
          <span style={styles.phase}>Phase 1 · Day 6 (Core Product)</span>
        </div>
        <StatusBar />
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={styles.main}>
        {/* Natural Language Query Input */}
        <section style={styles.card}>
          <QueryInput onSubmit={handleQuery} status={status} />
        </section>

        {/* Loading state */}
        {status === 'loading' && (
          <div style={styles.loadingBanner}>
            <span style={styles.spinner}>⏳</span>
            <div>
              <div style={styles.loadingTitle}>Executing query against Supabase…</div>
              <div style={styles.loadingSubtitle}>"{lastQuestion}"</div>
            </div>
          </div>
        )}

        {/* Error state with action to dismiss */}
        {status === 'error' && (
          <div style={styles.errorBanner}>
            <div style={styles.errorHeader}>
              <strong>❌ Query Execution Error</strong>
              <button style={styles.dismissBtn} onClick={() => setErrorMsg('')}>
                Dismiss
              </button>
            </div>
            <p style={styles.errorText}>{errorMsg}</p>
          </div>
        )}

        {/* Results — shown on success */}
        {status === 'success' && result && (
          <>
            {/* Interactive SQL Preview & Sandbox */}
            <section>
              <SqlPreview
                result={result}
                onRunCustomSql={handleRunCustomSql}
                running={sandboxExecuting}
              />
            </section>

            {/* Visual Charts */}
            <section>
              <ResultsChart result={result} />
            </section>

            {/* Results Table */}
            <section>
              <ResultsTable result={result} />
            </section>
          </>
        )}

        {/* Persistent Query History */}
        <section>
          <QueryHistory
            history={history}
            loading={historyLoading}
            onSelectQuery={handleSelectHistoryQuery}
            onRefresh={loadHistory}
          />
        </section>

        {/* Idle state hint */}
        {status === 'idle' && (
          <div style={styles.idleHint}>
            <div style={styles.idleIcon}>💬</div>
            <p style={styles.idleText}>
              Type a question above or pick a query from the <strong>Saved Query History</strong> to inspect and visualize data.
            </p>
            <p style={styles.idleNote}>
              Day 6 Core Product: 100% real Supabase PostgreSQL data · persistent query logs · editable SQL sandbox.
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
    maxWidth: 920,
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
    gap: 18,
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
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dismissBtn: {
    fontSize: '0.75rem',
    background: 'none',
    border: '1px solid #fca5a5',
    padding: '2px 8px',
    borderRadius: 4,
    color: '#991b1b',
    cursor: 'pointer',
  },
  errorText: {
    margin: '6px 0 0',
    fontSize: '0.875rem',
    lineHeight: 1.4,
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
