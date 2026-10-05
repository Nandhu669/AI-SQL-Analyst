# 🤖 AI Natural Language SQL Analyst & Sandbox

> Ask questions in plain English, get SQL answers — a learning project built day by day.

**Current phase:** Phase 1 · Day 5 — Supabase Database Integration  
**Branch:** `main`  
**Status:** Frontend, API routes, and Supabase PostgreSQL connected · AI integration coming in Days 7–8

---

## What This Project Does

This tool lets users describe a data question in natural language (e.g. *"Show me total sales by product for the last 30 days"*) and receive a validated, executable SQL query in return. The AI component uses an LLM (via OpenRouter) to translate the question, and results are run against a Supabase PostgreSQL database — then displayed as an interactive table and chart.

---

## Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend | React + TypeScript (Vite) | ✅ Day 2 |
| Backend | Python + FastAPI | ✅ Day 2 |
| SQL Parser | sqlglot | ✅ Day 4 |
| Charts | Recharts | ✅ Day 3 |
| SQL Highlighting | react-syntax-highlighter | ✅ Day 3 |
| Database | Supabase PostgreSQL | ✅ Day 5 |
| LLM Gateway | OpenRouter | 🔜 Day 7 |
| Frontend Deploy | Vercel | 🔜 Day 13 |
| Backend Deploy | Railway | 🔜 Day 13 |

---

## Project Structure

```
AI-SQL-Analyst-Sandbox/
├── frontend/                        ← React + TypeScript (Vite)
│   ├── src/
│   │   ├── main.tsx                 ← App entry point
│   │   ├── App.tsx                  ← Main layout + query lifecycle
│   │   ├── api/
│   │   │   ├── health.ts            ← GET /healthz call
│   │   │   └── mcp.ts               ← POST /query, POST /execute, GET /tools, GET /schema
│   │   ├── components/
│   │   │   ├── QueryInput.tsx        ← NL text box + submit + example chips
│   │   │   ├── SqlPreview.tsx        ← Syntax-highlighted SQL + copy button + badges
│   │   │   ├── StatusBar.tsx         ← Backend / DB / LLM connection badges
│   │   │   ├── ResultsTable.tsx      ← Dynamic data table (columns + rows)
│   │   │   └── ResultsChart.tsx      ← Bar / Line / Pie chart tabs (Recharts)
│   │   ├── types/
│   │   │   └── query.ts              ← Shared TypeScript types (QueryResult, etc.)
│   │   └── mocks/
│   │       └── mockQueryResult.ts    ← Mock data (reference shape for real API)
│   ├── .env.example
│   └── package.json
├── backend/                         ← Python + FastAPI
│   ├── app/
│   │   ├── main.py                  ← FastAPI app + CORS + router registration
│   │   ├── config.py                ← Typed settings via pydantic-settings
│   │   ├── models/
│   │   │   └── mcp.py               ← Pydantic request/response models
│   │   └── routers/
│   │       └── mcp.py               ← 4 MCP endpoints (query, execute, tools, schema)
│   ├── .env.example
│   └── requirements.txt
├── database/                        ← SQL migrations (Day 5+)
├── tests/                           ← Test suites (Day 10+)
├── docs/                            ← Extended documentation
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Python** ≥ 3.11
- **Git**

---

### 1. Clone the repository

```bash
git clone https://github.com/Nandhu669/AI-SQL-Analyst.git
cd AI-SQL-Analyst
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy the environment template
cp .env.example .env

# Start the backend
uvicorn app.main:app --reload --port 8000
```

The backend is running at **http://localhost:8000**  
Interactive API docs (Swagger UI): **http://localhost:8000/docs**

---

### 3. Frontend setup

Open a **new terminal** tab:

```bash
cd frontend

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env

# Start the frontend dev server
npm run dev
```

The frontend is running at **http://localhost:5173**

---

## Environment Variables

### Frontend — `frontend/.env`

| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | FastAPI backend URL | No — defaults to `http://localhost:8000` |

### Backend — `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Day 5+ |
| `SUPABASE_KEY` | Supabase anon/service key | Day 5+ |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | Day 7+ |

> **Important:** Never commit real `.env` files. They are gitignored. Only `.env.example` files are tracked.

---

## API Reference

All routes are documented interactively at **http://localhost:8000/docs**

| Method | Endpoint | What it does | Status |
|---|---|---|---|
| `GET` | `/healthz` | Backend health check | ✅ Day 2 |
| `POST` | `/api/v1/mcp/query` | Convert NL question → SQL | ✅ Day 4 (stub → real LLM in Day 7) |
| `POST` | `/api/v1/mcp/execute` | Execute a validated read-only SQL query | ✅ Day 4 (stub → real DB in Day 5) |
| `GET` | `/api/v1/mcp/tools` | List available tool definitions | ✅ Day 4 |
| `GET` | `/api/v1/mcp/schema` | Return database table/column schema | ✅ Day 4 (stub → live introspection in Day 5) |

### SQL Safety

`POST /api/v1/mcp/execute` uses **sqlglot** to parse the SQL into an AST before running it.  
Any query that is not a `SELECT` statement is rejected with `HTTP 400` — immediately, permanently.  
This includes: `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`.

```bash
# Test the safety check (PowerShell):
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/mcp/execute" `
  -Method POST -ContentType "application/json" `
  -Body '{"sql":"DROP TABLE orders"}'
# → HTTP 400: Only SELECT queries are allowed.
```

---

## How Frontend Communicates With Backend

The frontend reads `VITE_API_BASE_URL` from its `.env` file (defaults to `http://localhost:8000`).  
All API calls go through `frontend/src/api/` — no hardcoded URLs in component code.

```
User types question
      ↓
React (localhost:5173)
      ↓
POST /api/v1/mcp/query   →  FastAPI returns generated SQL
      ↓
POST /api/v1/mcp/execute →  FastAPI validates + returns rows
      ↓
SqlPreview + ResultsChart + ResultsTable render the result
```

CORS is configured in `backend/app/main.py` to allow `http://localhost:5173` during local development.

---

## Day-by-Day Build Log

### ✅ Day 2 — Foundation Setup
- Monorepo project structure (`frontend/`, `backend/`, `database/`, `tests/`, `docs/`)
- React + TypeScript frontend (Vite)
- FastAPI backend with `GET /healthz`
- Environment variable templates (no real secrets)
- Root `.gitignore` and `.gitattributes`
- Initial Git commit

### ✅ Day 3 — Frontend UI Shell
- **QueryInput** — natural language textarea with character count, Ctrl+Enter shortcut, example question chips
- **SqlPreview** — syntax-highlighted SQL display (VS Code dark theme) with copy button, execution time badge, collapsible panel
- **StatusBar** — real backend health badge (calls `/healthz`) + mocked DB / LLM badges
- **ResultsTable** — dynamic columns and rows, horizontal scroll, alternating row colours
- **ResultsChart** — bar / line / pie tabs powered by Recharts, auto-detects category and value columns
- Shared TypeScript types (`QueryResult`, `QueryStatus`, `ChartType`, `ServiceStatus`)
- Mock data shaped exactly like the real Day 4 API response

### ✅ Day 4 — FastAPI Backend Routes
- **`POST /api/v1/mcp/query`** — accepts NL question, returns stub SQL (real LLM in Day 7)
- **`POST /api/v1/mcp/execute`** — validates SQL with sqlglot AST parser, returns stub rows
- **`GET /api/v1/mcp/tools`** — returns MCP tool definitions
- **`GET /api/v1/mcp/schema`** — returns database schema
- Pydantic request/response models for all endpoints
- Frontend wired to real API — `simulateQuery()` replaced with actual `fetch()` calls

### ✅ Day 5 — Supabase Database Integration
- **Supabase Client**: Configured `supabase==2.32.0` singleton client in FastAPI
- **Database Schema**: 
  - `mcp_queries` — records query prompts, SQL, timing, and row count
  - `mcp_servers` — tracks backend tool servers and status
  - `query_audit_logs` — captures SQL safety validation logs
  - `orders` & `customers` — sample data tables with 10 orders and 5 customers
- **Schema Introspection**: `public_schema_columns` view provides live metadata to `GET /api/v1/mcp/schema`
- **Read-Only Execution**: `POST /api/v1/mcp/execute` runs real queries against Supabase and logs executions to `mcp_queries`
- **Dynamic Status Bar**: `GET /api/v1/status` powers the frontend `StatusBar` with real 🟢 database connection state

---

## Intentionally Deferred

| Feature | Target Day |
|---|---|
| Core product save/load verification (End-to-End without AI) | Day 6 |
| LLM system prompt + structured output | Day 7 |
| OpenRouter LLM SQL generation | Day 7 |
| Schema context injection for LLM | Day 8 |
| AST + blocklist SQL safety hardening | Day 11 |
| Request latency / token logging middleware | Day 12 |
| Production deployment (Vercel + Railway) | Day 13 |
| Evaluation benchmark (20 test cases) | Day 10 |

---

## Contributing

This is a personal learning project built phase by phase as part of [The Lab — 14-Day Build Roadmap](https://riwano.com/lab). Each day's work is committed separately so the git history reflects the learning journey.
