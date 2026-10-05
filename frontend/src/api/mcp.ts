/**
 * mcp.ts — API client for FastAPI MCP endpoints.
 */

import type { QueryHistoryItem } from '../types/query'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// ── Response types ────────────────────────────────────────────────────────────

export interface QueryResponse {
  sql: string
  status: string
  message: string
}

export interface ExecuteResponse {
  query_id?: string
  columns: string[]
  rows: Record<string, unknown>[]
  execution_time_ms: number
  row_count: number
}

export interface ToolDefinition {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

export interface SchemaColumn {
  name: string
  type: string
  nullable: boolean
}

export interface SchemaTable {
  table_name: string
  columns: SchemaColumn[]
}

export interface SchemaResponse {
  tables: SchemaTable[]
  database: string
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/mcp/query
 * Converts a natural-language question into SQL.
 */
export async function generateQuery(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/mcp/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `Query failed: HTTP ${res.status}`)
  }
  return res.json() as Promise<QueryResponse>
}

/**
 * POST /api/v1/mcp/execute
 * Executes a validated read-only SQL query and records telemetry.
 */
export async function executeQuery(sql: string, prompt?: string): Promise<ExecuteResponse> {
  const res = await fetch(`${API_BASE}/api/v1/mcp/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, prompt }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `Execute failed: HTTP ${res.status}`)
  }
  return res.json() as Promise<ExecuteResponse>
}

/**
 * GET /api/v1/mcp/queries
 * Fetches recent query execution history from Supabase mcp_queries table.
 */
export async function fetchQueryHistory(): Promise<QueryHistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/mcp/queries`)
  if (!res.ok) throw new Error(`Query history fetch failed: HTTP ${res.status}`)
  return res.json() as Promise<QueryHistoryItem[]>
}

/**
 * GET /api/v1/mcp/tools
 * Returns the list of available tool definitions.
 */
export async function fetchTools(): Promise<ToolDefinition[]> {
  const res = await fetch(`${API_BASE}/api/v1/mcp/tools`)
  if (!res.ok) throw new Error(`Tools fetch failed: HTTP ${res.status}`)
  return res.json() as Promise<ToolDefinition[]>
}

/**
 * GET /api/v1/mcp/schema
 * Returns the database schema for context display.
 */
export async function fetchSchema(): Promise<SchemaResponse> {
  const res = await fetch(`${API_BASE}/api/v1/mcp/schema`)
  if (!res.ok) throw new Error(`Schema fetch failed: HTTP ${res.status}`)
  return res.json() as Promise<SchemaResponse>
}
