"""
routers/mcp.py — The 4 MCP API endpoints.

WHAT IS AN MCP ENDPOINT?
  MCP stands for "Model Context Protocol" — a pattern where the backend
  exposes structured tools that an AI model can use.
  The frontend calls these routes; eventually the AI will too.

THE 4 ROUTES:
  POST /api/v1/mcp/query   → Convert NL question to SQL
  POST /api/v1/mcp/execute → Execute a validated SQL query
  GET  /api/v1/mcp/tools   → List available tools
  GET  /api/v1/mcp/schema  → Return database schema for AI context

DAY 4 STRATEGY (stub responses):
  - Routes are real and fully wired to the frontend
  - Data inside is mocked/hardcoded
  - Day 5 replaces execute stub with real Supabase
  - Day 7 replaces query stub with real OpenRouter LLM
  - Nothing else changes when we do that swap

SAFETY:
  Even in stub mode, /execute validates that the SQL is a SELECT statement.
  This mindset (safety first, always) is enforced from Day 4 onwards.
"""

import time
import sqlglot
from sqlglot import ErrorLevel
from sqlglot import expressions as exp

from fastapi import APIRouter, HTTPException

from app.models.mcp import (
    QueryRequest, QueryResponse,
    ExecuteRequest, ExecuteResponse,
    ToolDefinition,
    SchemaColumn, SchemaTable, SchemaResponse,
)

router = APIRouter(prefix="/api/v1/mcp", tags=["MCP"])


# ── POST /api/v1/mcp/query ────────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse, summary="Convert NL question to SQL")
async def generate_query(body: QueryRequest) -> QueryResponse:
    """
    Convert a natural-language question into a safe SQL query.

    **Day 4:** Returns a stub SQL template with the user's question echoed.
    **Day 7:** Replace the stub block with a real OpenRouter LLM call that
               injects the database schema and generates accurate SQL.

    The response shape never changes — only the implementation inside changes.
    """
    # ── Day 4 stub ─────────────────────────────────────────────────────────────
    # TODO Day 7: replace this block with OpenRouter LLM call
    #   1. Fetch schema from get_schema()
    #   2. Build system prompt with schema context
    #   3. Call OpenRouter API with the user's question
    #   4. Parse structured JSON response to extract SQL
    stub_sql = (
        "-- Day 4 stub: real LLM SQL generation comes in Day 7\n"
        "SELECT\n"
        "  product_name,\n"
        "  SUM(amount) AS total_sales\n"
        "FROM orders\n"
        "WHERE created_at >= NOW() - INTERVAL '30 days'\n"
        "GROUP BY product_name\n"
        "ORDER BY total_sales DESC\n"
        "LIMIT 10;"
    )
    # ── End stub ───────────────────────────────────────────────────────────────

    return QueryResponse(
        sql=stub_sql,
        status="ok",
        message=f"Stub response (Day 7 will generate real SQL). Question received: '{body.question[:80]}'",
    )


# ── POST /api/v1/mcp/execute ──────────────────────────────────────────────────

@router.post("/execute", response_model=ExecuteResponse, summary="Execute a read-only SQL query")
async def execute_query(body: ExecuteRequest) -> ExecuteResponse:
    """
    Execute a validated, read-only SQL query against the database.

    **Safety:** Even in stub mode, this endpoint rejects any SQL that is
    not a SELECT statement. Only SELECT is allowed — ever.

    **Day 4:** Returns stub rows after validating the SQL shape.
    **Day 5:** Replace stub rows with real Supabase query execution.
    """
    # ── SQL Safety Validation (active from Day 4 onwards) ─────────────────────
    # sqlglot parses the SQL into an AST (Abstract Syntax Tree).
    # We check if the root node is a Select expression.
    # If not → reject with 400 Bad Request. No exceptions.
    try:
        parsed = sqlglot.parse_one(body.sql, error_level=ErrorLevel.RAISE)
    except Exception as parse_err:
        raise HTTPException(
            status_code=400,
            detail=f"SQL parse error: {parse_err}. Only valid SELECT queries are accepted.",
        )

    if not isinstance(parsed, exp.Select):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only SELECT queries are allowed. "
                f"Received: {type(parsed).__name__}. "
                "INSERT, UPDATE, DELETE, DROP, ALTER, and TRUNCATE are permanently blocked."
            ),
        )

    # ── Day 4 stub execution ──────────────────────────────────────────────────
    # TODO Day 5: replace this block with real Supabase query execution
    #   1. Get async Supabase client
    #   2. Execute body.sql with a 3-second timeout
    #   3. Map result columns and rows to the response model
    start = time.perf_counter()

    stub_rows = [
        {"product_name": "Laptop Pro",     "total_sales": 48200},
        {"product_name": "Wireless Mouse", "total_sales": 31500},
        {"product_name": "USB Hub",        "total_sales": 19800},
        {"product_name": "Monitor 27\"",   "total_sales": 17200},
        {"product_name": "Keyboard RGB",   "total_sales": 14600},
    ]
    stub_columns = ["product_name", "total_sales"]

    elapsed_ms = int((time.perf_counter() - start) * 1000) or 8
    # ── End stub ───────────────────────────────────────────────────────────────

    return ExecuteResponse(
        columns=stub_columns,
        rows=stub_rows,
        execution_time_ms=elapsed_ms,
        row_count=len(stub_rows),
    )


# ── GET /api/v1/mcp/tools ────────────────────────────────────────────────────

@router.get("/tools", response_model=list[ToolDefinition], summary="List available tools")
async def list_tools() -> list[ToolDefinition]:
    """
    Returns the available tool definitions in MCP format.

    These definitions describe what the backend can do.
    The LLM will use these definitions (in Day 7+) to decide which tool to call.
    """
    return [
        ToolDefinition(
            name="query_database",
            description=(
                "Convert a natural-language question into a safe read-only SQL query "
                "and execute it against the connected database. "
                "Returns columns, rows, and execution time."
            ),
            input_schema={
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The user's natural-language question about the data",
                    }
                },
                "required": ["question"],
            },
        ),
        ToolDefinition(
            name="get_schema",
            description=(
                "Return the current database schema including table names, "
                "column names, and data types. Used for SQL generation context."
            ),
            input_schema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
    ]


# ── GET /api/v1/mcp/schema ────────────────────────────────────────────────────

@router.get("/schema", response_model=SchemaResponse, summary="Get database schema")
async def get_schema() -> SchemaResponse:
    """
    Return the database schema for LLM context injection.

    The schema tells the LLM what tables and columns exist so it can
    write accurate SQL for the user's question.

    **Day 4:** Static mock schema matching the stub data in /execute.
    **Day 5:** Replace with live Supabase information_schema introspection.
    """
    # ── Day 4 static schema ───────────────────────────────────────────────────
    # TODO Day 5: replace with live query:
    #   SELECT table_name, column_name, data_type, is_nullable
    #   FROM information_schema.columns
    #   WHERE table_schema = 'public'
    return SchemaResponse(
        database="sandbox",
        tables=[
            SchemaTable(
                table_name="orders",
                columns=[
                    SchemaColumn(name="id",           type="uuid",        nullable=False),
                    SchemaColumn(name="customer_id",  type="uuid",        nullable=True),
                    SchemaColumn(name="product_name", type="text",        nullable=False),
                    SchemaColumn(name="amount",       type="numeric",     nullable=False),
                    SchemaColumn(name="status",       type="text",        nullable=False),
                    SchemaColumn(name="created_at",   type="timestamptz", nullable=False),
                ],
            ),
            SchemaTable(
                table_name="customers",
                columns=[
                    SchemaColumn(name="id",         type="uuid",        nullable=False),
                    SchemaColumn(name="name",        type="text",        nullable=False),
                    SchemaColumn(name="email",       type="text",        nullable=False),
                    SchemaColumn(name="region",      type="text",        nullable=True),
                    SchemaColumn(name="created_at",  type="timestamptz", nullable=False),
                ],
            ),
            SchemaTable(
                table_name="mcp_queries",
                columns=[
                    SchemaColumn(name="id",              type="uuid",        nullable=False),
                    SchemaColumn(name="user_prompt",     type="text",        nullable=False),
                    SchemaColumn(name="generated_query", type="text",        nullable=True),
                    SchemaColumn(name="execution_time",  type="integer",     nullable=True),
                    SchemaColumn(name="row_count",       type="integer",     nullable=True),
                    SchemaColumn(name="status",          type="text",        nullable=False),
                    SchemaColumn(name="created_at",      type="timestamptz", nullable=False),
                ],
            ),
        ],
    )
