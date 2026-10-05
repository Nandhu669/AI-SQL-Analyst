/**
 * query.ts — Shared TypeScript types for the AI SQL Analyst.
 *
 * These types describe the shape of data flowing through the app:
 *   User input → API request → API response → UI display
 */

// ── Query lifecycle ───────────────────────────────────────────────────────────

/** Status of the current query request */
export type QueryStatus = 'idle' | 'loading' | 'success' | 'error'

/** Chart view the user has selected */
export type ChartType = 'bar' | 'line' | 'pie'

// ── API response shape ────────────────────────────────────────────────────────

/**
 * The result returned after executing a query.
 */
export interface QueryResult {
  /** The SQL query (read-only, validated) */
  sql: string
  /** Column names from the database result */
  columns: string[]
  /** Result rows — each row is a record of column → value */
  rows: Record<string, unknown>[]
  /** How long the SQL execution took in milliseconds */
  executionTimeMs: number
  /** Total number of rows returned */
  rowCount: number
  /** Persistent query UUID from mcp_queries table in Supabase */
  queryId?: string
  /** Associated user prompt or question */
  prompt?: string
}

/**
 * Query history item fetched from GET /api/v1/mcp/queries.
 */
export interface QueryHistoryItem {
  id: string
  user_prompt: string
  generated_query?: string
  execution_time?: number
  row_count?: number
  status: 'success' | 'error'
  created_at: string
}

// ── Service status ────────────────────────────────────────────────────────────

/** Connection status of a dependent service */
export type ServiceConnectionStatus = 'connected' | 'disconnected' | 'checking'

/** Represents one service shown in the status bar */
export interface ServiceStatus {
  /** Display name, e.g. "Backend", "Database", "LLM" */
  name: string
  status: ServiceConnectionStatus
  /** Optional note shown below the badge */
  note?: string
}
