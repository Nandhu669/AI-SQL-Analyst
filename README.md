# 🤖 AI Natural Language SQL Analyst & Sandbox

> Ask questions in plain English, get SQL answers — a learning project built day by day.

**Current phase:** Phase 1 · Day 2 — Foundation Setup  
**Status:** Foundation complete · AI/SQL features coming in later phases

---

## What This Project Does

This tool lets users describe a data question in natural language (e.g. *"How many orders were placed last month?"*) and receive a validated, executable SQL query in return. The AI component uses an LLM (via OpenRouter) to translate the question, and results are run against a Supabase PostgreSQL database.

Day 2 establishes the complete development foundation — the project structure, frontend, backend, health check, and environment configuration — without any AI or database functionality yet.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | Python + FastAPI |
| Database | Supabase PostgreSQL *(Day 3+)* |
| LLM Gateway | OpenRouter *(Day 4+)* |
| Frontend Deploy | Vercel *(Day 8+)* |
| Backend Deploy | Railway *(Day 8+)* |

---

## Project Structure

```
AI-SQL-Analyst-Sandbox/
├── frontend/               ← React + TypeScript (Vite)
│   ├── src/
│   │   ├── main.tsx        ← App entry point
│   │   ├── App.tsx         ← Main UI component
│   │   └── api/
│   │       └── health.ts   ← Backend API calls
│   ├── .env.example        ← Frontend env template
│   └── package.json
├── backend/                ← Python + FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         ← FastAPI app + /healthz endpoint
│   │   └── config.py       ← Typed settings (pydantic-settings)
│   ├── .env.example        ← Backend env template
│   └── requirements.txt
├── database/               ← SQL migrations (Day 3+)
├── tests/                  ← Test suites (Day 3+)
├── docs/                   ← Extended documentation
├── .gitignore
└── README.md               ← This file
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
git clone <your-repo-url>
cd AI-SQL-Analyst-Sandbox
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

# Copy the environment template (no real values needed for Day 2)
cp .env.example .env

# Start the backend
uvicorn app.main:app --reload --port 8000
```

The backend is running at **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

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
| `VITE_API_BASE_URL` | FastAPI backend URL | No (defaults to `http://localhost:8000`) |

### Backend — `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Day 3+ |
| `SUPABASE_KEY` | Supabase anon/service key | Day 3+ |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | Day 4+ |

> **Important:** Never commit real `.env` files. They are gitignored. Only `.env.example` files are tracked.

---

## Verifying the Setup

### Health check (curl / PowerShell)

```bash
# curl:
curl http://localhost:8000/healthz

# PowerShell:
Invoke-WebRequest http://localhost:8000/healthz | Select-Object -ExpandProperty Content
```

Expected response:
```json
{"status": "ok"}
```

### Frontend health check button

1. Start the backend.
2. Start the frontend.
3. Open **http://localhost:5173**.
4. Click **"Check Backend Health"**.
5. You should see a green ✅ confirmation with the JSON response.

If the backend is not running, you'll see a red ❌ error with instructions.

---

## How Frontend Communicates With Backend

The frontend reads `VITE_API_BASE_URL` from its `.env` file (defaults to `http://localhost:8000`).
All API calls go through `frontend/src/api/` — never with a hardcoded URL in component code.

```
React (localhost:5173)  →  GET /healthz  →  FastAPI (localhost:8000)
```

CORS is configured in `backend/app/main.py` to allow `http://localhost:5173` during local development.

---

## Day 2 Scope (What Is Implemented)

- [x] Monorepo-style project structure
- [x] React + TypeScript frontend (Vite)
- [x] FastAPI backend
- [x] `GET /healthz` health endpoint
- [x] Frontend → backend connectivity check UI
- [x] Environment variable templates (no real secrets)
- [x] Root `.gitignore`
- [x] Initial Git commit

---

## Intentionally Deferred (Day 3+)

| Feature | Target Day |
|---|---|
| Supabase connection + schema | Day 3 |
| OpenRouter LLM integration | Day 4 |
| Natural language → SQL translation | Day 4 |
| AST validation + query execution | Day 5 |
| Results table / charts | Day 6 |
| Authentication | Day 7 |
| Production deployment | Day 8 |
| Evaluation framework | Day 9 |

---

## Contributing

This is a personal learning project built phase by phase. Each day's work is committed separately so the git history reflects the learning journey.
