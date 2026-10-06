# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Data analysts, business intelligence teams, and operations leads who need immediate, self-service insights from production SQL databases without waiting for engineering backlogs or writing boilerplate queries manually.

## Product Purpose
Convert plain English business questions into safe, optimized, read-only SQL queries, execute them in real-time against live PostgreSQL databases (Supabase), and immediately deliver multi-dimensional visual charts, structured data tables, and an interactive SQL sandbox editor.

## Positioning
An enterprise-grade, MCP-compliant (Model Context Protocol) AI data analyst combining zero-hallucination read-only AST safety validation (`sqlglot`), multi-model failover across verified free LLMs, real PostgreSQL database execution, and an editable live query workbench.

## Operating Context
Desktop web analytical workspace used during sprint planning, revenue reviews, customer cohort analyses, and ad-hoc investigations. The user operates with high information density, rapid keyboard workflows (`Ctrl+Enter` / `Cmd+Enter`), schema discovery, and query reproduction from persistent audit history.

## Capabilities and Constraints
- Natural language to PostgreSQL query generation using OpenRouter free-tier LLMs (`:free` suffix models).
- Read-only AST validation enforcing strict SELECT-only query safety before execution.
- Real-time execution against live Supabase PostgreSQL tables (`orders`, `customers`, `mcp_queries`, `query_audit_logs`).
- Live database schema discovery displaying tables, columns, and data types with 1-click prompt injection.
- Interactive SQL Sandbox with instant custom SQL editing and re-execution.
- Adaptive visualizations (Bar, Line, and Pie charts using Recharts) with auto-axis detection.
- Paginated/scrollable tabular results with CSV export capability.
- Persistent query audit trail logging prompts, generated SQL, execution latency, and row counts.
- Zero fake/mock data in production mode: all operations hit live endpoints.

## Brand Commitments
Technical, precise, calm, and trustworthy. Built for operators who prize clarity, predictability, speed, and safety over conversational fluff.

## Evidence on Hand
- Live Supabase database at `https://buaprpsizcvfztqcusim.supabase.co` with real tables (`orders`, `customers`, `mcp_queries`, `query_audit_logs`) and RPC `execute_readonly_sql`.
- FastAPI backend serving `/api/v1/mcp/query`, `/api/v1/mcp/execute`, `/api/v1/mcp/queries`, `/api/v1/mcp/schema`, and `/api/v1/status`.
- Verified OpenRouter integration with automated model fallback.

## Product Principles
1. Truth Before Visuals: Never show synthetic or simulated numbers when live database connections exist.
2. Safety by Default: Guarantee read-only execution at AST parser, application logic, and PostgreSQL transaction levels.
3. Transparent Intelligence: Disclose the AI's step-by-step reasoning alongside the generated SQL.
4. Frictionless Flow: Allow analysts to transition seamlessly between natural language prompts, editable SQL code, visual charts, and raw records.

## Accessibility & Inclusion
WCAG 2.2 AA compliant contrast (>=4.5:1 text, >=3:1 large elements/controls), full keyboard navigability (focus rings, Enter / Ctrl+Enter shortcuts), clear state feedback (hover, active, focus, disabled, loading, empty, error), and support for system reduced-motion preferences.
