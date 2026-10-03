"""
main.py — FastAPI application entry point.

Day 2: Created app + CORS + GET /healthz
Day 4: Added MCP router (/api/v1/mcp/*)
Day 5: Added status router (/api/v1/status), version bumped to 0.5.0

Day 7+: Add DB lifespan events (connect on startup)
Day 12: Add request logging middleware
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import mcp as mcp_router
from app.routers import status as status_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI SQL Analyst API",
    description=(
        "Natural-language-to-SQL analyst backend.\n\n"
        "- **Day 2** — `/healthz` health check\n"
        "- **Day 4** — `/api/v1/mcp/*` query, execute, tools, schema routes\n"
        "- **Day 5** — `/api/v1/status` service status + real Supabase DB\n"
        "- **Day 7** — OpenRouter LLM integration\n"
    ),
    version="0.5.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(mcp_router.router)
app.include_router(status_router.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/healthz", tags=["Health"])
async def health_check() -> dict:
    """Returns {"status": "ok"} when the backend is running."""
    return {"status": "ok"}
