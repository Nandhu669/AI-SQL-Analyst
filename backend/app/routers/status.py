"""
routers/status.py — System status endpoint.

GET /api/v1/status returns the connection state of all 3 services:
  - backend: always "ok" if this endpoint responds
  - database: checks Supabase connectivity via a lightweight query
  - llm: checks OpenRouter connectivity via check_openrouter_health()
"""

from fastapi import APIRouter
from app.database.client import check_connection
from app.ai.client import check_openrouter_health

router = APIRouter(prefix="/api/v1", tags=["Status"])


@router.get("/status", summary="Service connection status")
async def get_status() -> dict:
    """
    Returns the connection state of backend, database, and LLM.
    Used by the frontend StatusBar to show 🟢/🔴 badges.
    """
    # Check database
    db_status = "connected" if check_connection() else "disconnected"

    # Check OpenRouter LLM Gateway
    is_llm_healthy = await check_openrouter_health()
    llm_status = "connected" if is_llm_healthy else "disconnected"

    return {
        "backend": "ok",
        "database": db_status,
        "llm": llm_status,
    }
