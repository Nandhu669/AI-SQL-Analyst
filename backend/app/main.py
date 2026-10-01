"""
main.py — FastAPI application entry point.

Day 2: Created app + CORS + GET /healthz
Day 4: Added MCP router with 4 new endpoints under /api/v1/mcp/

Day 5+: Add database lifespan events (connect/disconnect on startup/shutdown)
Day 12: Add request logging middleware
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import mcp as mcp_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI SQL Analyst API",
    description=(
        "Natural-language-to-SQL analyst backend.\n\n"
        "- **Day 2** — `/healthz` health check\n"
        "- **Day 4** — `/api/v1/mcp/*` query, execute, tools, schema routes\n"
        "- **Day 5** — Supabase database connection\n"
        "- **Day 7** — OpenRouter LLM integration\n"
    ),
    version="0.4.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the local Vite dev server (port 5173) to call this API.
# Update this list in production to your actual Vercel domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
# The MCP router registers all 4 endpoints under /api/v1/mcp/
app.include_router(mcp_router.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/healthz", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint.
    Returns {"status": "ok"} when the backend is running.
    """
    return {"status": "ok"}
