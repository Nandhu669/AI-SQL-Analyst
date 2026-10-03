"""
routers/status.py — System status endpoint.

GET /api/v1/status returns the connection state of all 3 services:
  - backend: always "ok" if this endpoint responds
  - database: checks Supabase connectivity via a lightweight query
  - llm: "not_configured" until Day 7 adds OpenRouter

WHY A SEPARATE STATUS ENDPOINT?
  The frontend StatusBar needs to know all 3 service states at once.
  Instead of 3 separate calls, one call to /api/v1/status returns everything.
  This is simpler, faster, and more reliable for the frontend badge display.
"""

from fastapi import APIRouter
from app.database.client import check_connection
from app.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["Status"])


@router.get("/status", summary="Service connection status")
async def get_status() -> dict:
    """
    Returns the connection state of backend, database, and LLM.

    Used by the frontend StatusBar to show 🟢/🔴 badges.

    Possible values:
      backend:  "ok" | "error"
      database: "connected" | "disconnected"
      llm:      "connected" | "not_configured"
    """
    settings = get_settings()

    # Check database
    db_status = "connected" if check_connection() else "disconnected"

    # Check LLM (Day 7: replace with real OpenRouter ping)
    llm_status = "connected" if settings.openrouter_api_key else "not_configured"

    return {
        "backend": "ok",
        "database": db_status,
        "llm": llm_status,
    }
