import { useState } from 'react'
import { checkHealth } from './api/health'
import type { HealthResponse } from './api/health'

// Status of the backend connectivity check
type CheckStatus = 'idle' | 'loading' | 'ok' | 'error'

function App() {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [response, setResponse] = useState<HealthResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleCheck = async () => {
    setStatus('loading')
    setResponse(null)
    setErrorMsg('')

    try {
      const data = await checkHealth()
      setResponse(data)
      setStatus('ok')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(
        `Backend unreachable (${msg}). ` +
        'Make sure FastAPI is running: cd backend && uvicorn app.main:app --reload'
      )
      setStatus('error')
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 AI SQL Analyst</h1>
        <span style={styles.badge}>Phase 1 · Day 2 Foundation</span>
      </header>

      <main style={styles.card}>
        <p style={styles.description}>
          This page confirms that the React frontend can talk to the FastAPI
          backend. The actual AI-to-SQL features will be added in later phases.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Backend Connectivity</h2>
          <p style={styles.hint}>
            Endpoint: <code>GET /healthz</code>
          </p>

          <button
            style={{
              ...styles.button,
              opacity: status === 'loading' ? 0.7 : 1,
            }}
            onClick={handleCheck}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '⏳ Checking…' : '🔍 Check Backend Health'}
          </button>

          {status === 'ok' && response && (
            <div style={{ ...styles.result, ...styles.resultOk }}>
              <strong>✅ Backend is reachable</strong>
              <pre style={styles.pre}>{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}

          {status === 'error' && (
            <div style={{ ...styles.result, ...styles.resultError }}>
              <strong>❌ Connection failed</strong>
              <p style={styles.errorText}>{errorMsg}</p>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Architecture</h2>
          <table style={styles.table}>
            <tbody>
              {[
                ['Frontend', 'React + TypeScript (Vite)'],
                ['Backend', 'Python + FastAPI'],
                ['Database', 'Supabase PostgreSQL (Day 3+)'],
                ['LLM Gateway', 'OpenRouter (Day 4+)'],
                ['Frontend Deploy', 'Vercel (Day 8+)'],
                ['Backend Deploy', 'Railway (Day 8+)'],
              ].map(([layer, tech]) => (
                <tr key={layer}>
                  <td style={styles.tdLabel}>{layer}</td>
                  <td style={styles.tdValue}>{tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

// ── Inline styles (no extra dependencies needed for Day 2) ────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 680,
    margin: '60px auto',
    padding: '0 24px',
    color: '#1a1a1a',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
  },
  badge: {
    background: '#e0f2fe',
    color: '#0369a1',
    borderRadius: 20,
    padding: '4px 14px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 32,
    background: '#fafafa',
  },
  description: {
    color: '#6b7280',
    marginTop: 0,
    lineHeight: 1.6,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: '1.1rem',
    marginBottom: 8,
    marginTop: 0,
    color: '#111827',
  },
  hint: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: '0 0 16px',
  },
  button: {
    padding: '10px 22px',
    fontSize: '0.95rem',
    fontWeight: 600,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  result: {
    marginTop: 16,
    padding: '14px 18px',
    borderRadius: 8,
    fontSize: '0.9rem',
  },
  resultOk: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
  },
  resultError: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
  },
  pre: {
    margin: '8px 0 0',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    whiteSpace: 'pre-wrap',
  },
  errorText: {
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '0.9rem',
  },
  tdLabel: {
    padding: '6px 12px 6px 0',
    fontWeight: 600,
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  tdValue: {
    padding: '6px 0',
    color: '#6b7280',
  },
}

export default App
