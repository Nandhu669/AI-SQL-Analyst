"""
main.py — FastAPI application entry point.

Day 2 scope:
  - Create the FastAPI app with CORS configured for the local Vite dev server.
  - Expose GET /healthz so the frontend can verify connectivity.

Day 3+: add database connections, routers, and middleware here.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI SQL Analyst API",
    description="Natural-language-to-SQL analyst backend. Day 2 — foundation only.",
    version="0.1.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the local Vite dev server (port 5173) to call this API.
# Update this list in production to your actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/healthz", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint.

    Returns {"status": "ok"} when the backend is running.
    Used by the frontend to verify connectivity.
    """
    return {"status": "ok"}
