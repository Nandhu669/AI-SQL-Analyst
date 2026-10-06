/**
 * App.tsx — Production Analytical Workbench & Query Orchestrator.
 *
 * Impeccable Craft Standards:
 *  - Mode: Operate (Data Analyst Workspace)
 *  - Collapsible dual-tab sidebar: Live Schema Explorer & Persistent Query Audit Trail
 *  - Clean SVG icon system (lucide-react), zero unicode emoji
 *  - Workspace view switcher: Overview & Charts | Raw Data Table | SQL Sandbox | Dual Split
 *  - 100% real Supabase PostgreSQL data execution with AST validation
 */

import { useState, useEffect } from 'react'
import {
  Database,
  Sparkles,
  History,
  BarChart3,
  Table2,
  Code2,
  Columns2,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
  X,
  Bot,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { StatusBar } from './components/StatusBar'
import { QueryInput } from './components/QueryInput'
import { SqlPreview } from './components/SqlPreview'
import { ResultsChart } from './components/ResultsChart'
import { ResultsTable } from './components/ResultsTable'
import { QueryHistory } from './components/QueryHistory'
import { SchemaExplorer } from './components/SchemaExplorer'
import { ShortcutModal } from './components/ShortcutModal'

import { generateQuery, executeQuery, fetchQueryHistory } from './api/mcp'
import type { QueryResult, QueryStatus, QueryHistoryItem } from './types/query'

type WorkspaceView = 'overview' | 'table' | 'sandbox' | 'split'
type SidebarTab = 'schema' | 'history'

export function App() {
  const [status, setStatus] = useState<QueryStatus>('idle')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [lastQuestion, setLastQuestion] = useState<string>('')
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState<boolean>(false)
  const [sandboxExecuting, setSandboxExecuting] = useState<boolean>(false)
  const [aiExplanation, setAiExplanation] = useState<string>('')
  const [reasoningExpanded, setReasoningExpanded] = useState<boolean>(true)

  // Layout & Navigation State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('schema')
  const [activeView, setActiveView] = useState<WorkspaceView>('overview')
  const [shortcutModalOpen, setShortcutModalOpen] = useState<boolean>(false)
  const [injectedText, setInjectedText] = useState<string>('')

  // ── Load persistent history ────────────────────────────────────────────────
  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const items = await fetchQueryHistory()
      setHistory(items)
    } catch {
      // Handled gracefully in UI
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Keyboard shortcut listener for '?'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setShortcutModalOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Natural Language Query Execution ───────────────────────────────────────
  const handleQuery = async (question: string) => {
    setStatus('loading')
    setResult(null)
    setErrorMsg('')
    setAiExplanation('')
    setLastQuestion(question)

    try {
      // Step 1: OpenRouter AI generation
      const { sql, message } = await generateQuery(question)
      setAiExplanation(message)

      // Step 2: Supabase PostgreSQL execution
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
      loadHistory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown query execution error'
      setErrorMsg(msg)
      setStatus('error')
      loadHistory()
    }
  }

  // ── Custom Sandbox SQL Execution ───────────────────────────────────────────
  const handleRunCustomSql = async (customSql: string) => {
    setSandboxExecuting(true)
    setErrorMsg('')

    try {
      const promptLabel = lastQuestion ? `Custom: ${lastQuestion}` : 'Sandbox Execution'
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

  // ── Select Query from History ──────────────────────────────────────────────
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

  // ── Schema Insertion & Template Runner ──────────────────────────────────────
  const handleInsertSchemaText = (text: string) => {
    setInjectedText(text)
  }

  const handleRunTemplate = async (sql: string, prompt: string) => {
    setLastQuestion(prompt)
    handleRunCustomSql(sql)
  }

  return (
    <div style={styles.appContainer}>
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <button
            style={styles.sidebarToggleBtn}
            onClick={() => setSidebarOpen((prev) => !prev)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          <div style={styles.brandGroup}>
            <div style={styles.brandIconWrapper}>
              <Database size={16} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <span style={styles.brandTitle}>AI SQL Analyst</span>
              <span style={styles.brandTag}>Production MCP · Live Supabase</span>
            </div>
          </div>
        </div>

        <div style={styles.navRight}>
          <StatusBar />

          <button
            style={styles.iconActionBtn}
            onClick={() => setShortcutModalOpen(true)}
            title="Keyboard shortcuts (?)"
            aria-label="View keyboard shortcuts"
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </header>

      {/* ── Main Workspace ────────────────────────────────────────────────── */}
      <div style={styles.workspace}>
        {/* Left Sidebar: Schema & History */}
        {sidebarOpen && (
          <aside style={styles.sidebar}>
            <div style={styles.sidebarTabs}>
              <button
                style={{
                  ...styles.sidebarTabBtn,
                  borderBottomColor: sidebarTab === 'schema' ? 'var(--accent-primary)' : 'transparent',
                  color: sidebarTab === 'schema' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                onClick={() => setSidebarTab('schema')}
              >
                <Database size={13} />
                <span>Schema Explorer</span>
              </button>

              <button
                style={{
                  ...styles.sidebarTabBtn,
                  borderBottomColor: sidebarTab === 'history' ? 'var(--accent-primary)' : 'transparent',
                  color: sidebarTab === 'history' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                onClick={() => setSidebarTab('history')}
              >
                <History size={13} />
                <span>Query History</span>
                <span style={styles.tabBadge} className="tabular-nums">
                  {history.length}
                </span>
              </button>
            </div>

            <div style={styles.sidebarContent}>
              {sidebarTab === 'schema' ? (
                <SchemaExplorer onInsertText={handleInsertSchemaText} onRunTemplate={handleRunTemplate} />
              ) : (
                <QueryHistory
                  history={history}
                  loading={historyLoading}
                  onSelectQuery={handleSelectHistoryQuery}
                  onRefresh={loadHistory}
                />
              )}
            </div>
          </aside>
        )}

        {/* Right Stage: Analysis & Results */}
        <main style={styles.mainStage}>
          {/* Query Command Input */}
          <QueryInput onSubmit={handleQuery} status={status} initialValue={injectedText} />

          {/* Loading Indicator */}
          {status === 'loading' && (
            <div style={styles.loadingBanner}>
              <div style={styles.loadingSpinnerWrapper}>
                <span className="pulsing-dot" style={styles.loadingDot} />
              </div>
              <div style={styles.loadingInfo}>
                <span style={styles.loadingTitle}>Generating SQL with OpenRouter AI & Executing on Supabase…</span>
                <span style={styles.loadingSubtitle}>"{lastQuestion}"</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {status === 'error' && (
            <div style={styles.errorBanner}>
              <div style={styles.errorHeader}>
                <div style={styles.errorTitleGroup}>
                  <AlertCircle size={15} style={{ color: 'var(--accent-danger)' }} />
                  <span style={styles.errorTitle}>Execution Error</span>
                </div>
                <button style={styles.dismissBtn} onClick={() => setErrorMsg('')} aria-label="Dismiss error">
                  <X size={13} />
                  <span>Dismiss</span>
                </button>
              </div>
              <p style={styles.errorText}>{errorMsg}</p>
            </div>
          )}

          {/* AI Explanation Card */}
          {aiExplanation && status === 'success' && (
            <div style={styles.reasoningCard}>
              <div style={styles.reasoningHeader} onClick={() => setReasoningExpanded((prev) => !prev)}>
                <div style={styles.reasoningTitleGroup}>
                  <Brain size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span style={styles.reasoningTitle}>AI Analytical Reasoning</span>
                </div>
                <button style={styles.expandBtn} aria-label="Toggle AI explanation">
                  {reasoningExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {reasoningExpanded && <p style={styles.reasoningText}>{aiExplanation}</p>}
            </div>
          )}

          {/* Results Workbench: View Tabs & Display */}
          {status === 'success' && result && (
            <div style={styles.resultsWorkbench}>
              {/* View Switcher Tabs */}
              <div style={styles.viewTabs}>
                <button
                  style={{
                    ...styles.viewTab,
                    backgroundColor: activeView === 'overview' ? 'var(--bg-surface)' : 'transparent',
                    color: activeView === 'overview' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderColor: activeView === 'overview' ? 'var(--border-subtle)' : 'transparent',
                  }}
                  onClick={() => setActiveView('overview')}
                >
                  <BarChart3 size={13} />
                  <span>Overview & Charts</span>
                </button>

                <button
                  style={{
                    ...styles.viewTab,
                    backgroundColor: activeView === 'table' ? 'var(--bg-surface)' : 'transparent',
                    color: activeView === 'table' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderColor: activeView === 'table' ? 'var(--border-subtle)' : 'transparent',
                  }}
                  onClick={() => setActiveView('table')}
                >
                  <Table2 size={13} />
                  <span>Data Table</span>
                </button>

                <button
                  style={{
                    ...styles.viewTab,
                    backgroundColor: activeView === 'sandbox' ? 'var(--bg-surface)' : 'transparent',
                    color: activeView === 'sandbox' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderColor: activeView === 'sandbox' ? 'var(--border-subtle)' : 'transparent',
                  }}
                  onClick={() => setActiveView('sandbox')}
                >
                  <Code2 size={13} />
                  <span>SQL Sandbox</span>
                </button>

                <button
                  style={{
                    ...styles.viewTab,
                    backgroundColor: activeView === 'split' ? 'var(--bg-surface)' : 'transparent',
                    color: activeView === 'split' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderColor: activeView === 'split' ? 'var(--border-subtle)' : 'transparent',
                  }}
                  onClick={() => setActiveView('split')}
                >
                  <Columns2 size={13} />
                  <span>Dual Split</span>
                </button>
              </div>

              {/* View Content Panels */}
              <div style={styles.viewContent}>
                {activeView === 'overview' && (
                  <div style={styles.overviewGrid}>
                    <ResultsChart result={result} />
                    <SqlPreview
                      result={result}
                      onRunCustomSql={handleRunCustomSql}
                      running={sandboxExecuting}
                    />
                    <ResultsTable result={result} />
                  </div>
                )}

                {activeView === 'table' && <ResultsTable result={result} />}

                {activeView === 'sandbox' && (
                  <SqlPreview
                    result={result}
                    onRunCustomSql={handleRunCustomSql}
                    running={sandboxExecuting}
                  />
                )}

                {activeView === 'split' && (
                  <div style={styles.splitGrid}>
                    <div style={styles.splitCol}>
                      <SqlPreview
                        result={result}
                        onRunCustomSql={handleRunCustomSql}
                        running={sandboxExecuting}
                      />
                    </div>
                    <div style={styles.splitCol}>
                      <ResultsTable result={result} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Idle Onboarding State */}
          {status === 'idle' && (
            <div style={styles.idleCard}>
              <div style={styles.idleIconWrap}>
                <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h2 style={styles.idleHeading}>Ready for Analytical Queries</h2>
              <p style={styles.idleDescription}>
                Ask any question above in plain English or pick a database table from the <strong>Schema Explorer</strong> on the left to start analyzing live PostgreSQL records.
              </p>
              <div style={styles.featurePills}>
                <div style={styles.featurePill}>
                  <Bot size={12} style={{ color: 'var(--accent-success)' }} />
                  <span>OpenRouter Free AI</span>
                </div>
                <div style={styles.featurePill}>
                  <Database size={12} style={{ color: 'var(--accent-info)' }} />
                  <span>Supabase Live DB</span>
                </div>
                <div style={styles.featurePill}>
                  <Code2 size={12} style={{ color: 'var(--accent-warning)' }} />
                  <span>AST Read-Only Sandbox</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Keyboard Shortcuts Dialog ─────────────────────────────────────── */}
      <ShortcutModal isOpen={shortcutModalOpen} onClose={() => setShortcutModalOpen(false)} />
    </div>
  )
}

export default App

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-canvas)',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 18px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sidebarToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--accent-primary-subtle)',
    border: '1px solid var(--accent-primary-border)',
  },
  brandTitle: {
    display: 'block',
    fontSize: '0.92rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  brandTag: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  iconActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 310,
    flexShrink: 0,
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 53px)',
  },
  sidebarTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-surface-elevated)',
  },
  sidebarTabBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 10px',
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBadge: {
    fontSize: '0.65rem',
    padding: '1px 5px',
    backgroundColor: 'var(--bg-canvas)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-subtle)',
  },
  sidebarContent: {
    padding: 12,
    flex: 1,
    overflowY: 'auto',
  },
  mainStage: {
    flex: 1,
    padding: '16px 20px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    overflowY: 'auto',
    height: 'calc(100vh - 53px)',
  },
  loadingBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    backgroundColor: 'var(--accent-primary-subtle)',
    border: '1px solid var(--accent-primary-border)',
    borderRadius: 'var(--radius-md)',
  },
  loadingSpinnerWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
  },
  loadingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  loadingTitle: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  loadingSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--accent-primary)',
    fontStyle: 'italic',
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: 'var(--accent-danger-subtle)',
    border: '1px solid var(--accent-danger-border)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  errorTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--accent-danger)',
  },
  dismissBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 6px',
    backgroundColor: 'transparent',
    border: '1px solid var(--accent-danger)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent-danger)',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '0.8rem',
    color: 'var(--accent-danger)',
    lineHeight: 1.5,
    margin: 0,
  },
  reasoningCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
  },
  reasoningHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  reasoningTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  reasoningTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  reasoningText: {
    margin: '8px 0 0',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  resultsWorkbench: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  viewTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'var(--bg-surface-elevated)',
    padding: 3,
    borderRadius: 'var(--radius-sm)',
    alignSelf: 'flex-start',
    border: '1px solid var(--border-subtle)',
  },
  viewTab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  overviewGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: 12,
  },
  splitCol: {
    minWidth: 0,
  },
  idleCard: {
    padding: '48px 24px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px dashed var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  idleIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary-subtle)',
    border: '1px solid var(--accent-primary-border)',
    marginBottom: 4,
  },
  idleHeading: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  idleDescription: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    maxWidth: 500,
    lineHeight: 1.6,
    margin: 0,
  },
  featurePills: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  featurePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 9px',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
}
