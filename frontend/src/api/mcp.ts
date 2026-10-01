/**
 * mcp.ts — Real API calls to the FastAPI MCP endpoints.
 *
 * Day 3: The frontend called simulateQuery() — a fake local function.
 * Day 4: The frontend calls these real fetch() functions instead.
 *
 * The response types here match the Pydantic models on the backend exactly.
 * When Day 5 wires up Supabase and Day 7 wires up the LLM, these functions
 * don't change — only the backend stub logic gets replaced.
 *
 * WHY TWO SEPARATE CALLS (/query then /execute)?
 *   1. /query   → generates SQL from the user's question (future: LLM)
 *   2. /execute → runs the SQL and returns results (future: real Supabase)
 *
 *   Keeping them separate means:
 *   - The user can see the generated SQL BEFORE it runs
 *   - The backend can validate SQL safety BEFORE execution
 *   - We can add a "confirm before run" UX step if needed later
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// ── Response types (mirror the backend Pydantic models) ───────────────────────

export interface QueryResponse {
  sql: string
  status: string
  message: string
}

export interface ExecuteResponse {
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
 * Day 4: returns stub SQL. Day 7: returns LLM-generated SQL.
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
 * Executes a validated read-only SQL query and returns rows.
 * Day 4: returns stub rows. Day 5: returns real Supabase results.
 */
export async function executeQuery(sql: string): Promise<ExecuteResponse> {
  const res = await fetch(`${API_BASE}/api/v1/mcp/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `Execute failed: HTTP ${res.status}`)
  }
  return res.json() as Promise<ExecuteResponse>
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
