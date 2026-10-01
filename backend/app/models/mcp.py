"""
models/mcp.py — Pydantic request and response models for the MCP endpoints.

WHY PYDANTIC MODELS?
  FastAPI uses these to:
  1. Automatically validate incoming request bodies (wrong type → 422 error)
  2. Automatically generate the JSON schema shown in /docs
  3. Guarantee the response shape so the frontend always gets what it expects

LEARNING NOTE:
  Each model maps directly to one endpoint's input or output.
  When you read the router, you can look up the model here to understand
  exactly what data is flowing in and out.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


# ── Request bodies ─────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    """
    POST /api/v1/mcp/query — sent by the frontend.
    Contains the user's natural-language question.
    """
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Natural-language question from the user",
        examples=["Show me total sales by product for the last 30 days"],
    )


class ExecuteRequest(BaseModel):
    """
    POST /api/v1/mcp/execute — sent by the frontend.
    Contains the SQL query to run (must have been validated first).
    """
    sql: str = Field(
        ...,
        min_length=1,
        description="Read-only SQL query to execute against the database",
        examples=["SELECT product_name, SUM(amount) FROM orders GROUP BY 1"],
    )


# ── Response bodies ────────────────────────────────────────────────────────────

class QueryResponse(BaseModel):
    """
    POST /api/v1/mcp/query — returned by the backend.
    Contains the generated SQL and a status message.
    """
    sql: str = Field(description="Generated SQL query")
    status: str = Field(description="'ok' or 'error'")
    message: str = Field(default="", description="Human-readable note about the response")


class ExecuteResponse(BaseModel):
    """
    POST /api/v1/mcp/execute — returned by the backend.
    Contains the query results as columns + rows.

    NOTE: column names and row values use snake_case here (Python convention).
    The frontend maps execution_time_ms → executionTimeMs via the QueryResult type.
    """
    columns: list[str] = Field(description="Column names from the result set")
    rows: list[dict[str, Any]] = Field(description="Result rows as key-value pairs")
    execution_time_ms: int = Field(description="How long the query took in milliseconds")
    row_count: int = Field(description="Total number of rows returned")


# ── Tool definitions ───────────────────────────────────────────────────────────

class ToolDefinition(BaseModel):
    """One entry in the GET /api/v1/mcp/tools list."""
    name: str
    description: str
    input_schema: dict[str, Any]


# ── Schema models ──────────────────────────────────────────────────────────────

class SchemaColumn(BaseModel):
    """One column in a database table."""
    name: str
    type: str
    nullable: bool = True


class SchemaTable(BaseModel):
    """One table with its columns."""
    table_name: str
    columns: list[SchemaColumn]


class SchemaResponse(BaseModel):
    """
    GET /api/v1/mcp/schema — returned by the backend.
    Used by the LLM for schema context injection (Day 7+).

    Day 4: static mock.
    Day 5: replaced with live Supabase introspection.
    """
    tables: list[SchemaTable]
    database: str = Field(default="sandbox", description="Database name / identifier")
