"""
database/client.py — Supabase client singleton.

WHY A SINGLETON?
  Creating a Supabase client on every request is wasteful — it sets up HTTP
  connection pools each time. A singleton creates the client once at startup
  and reuses it for every request.

HOW TO USE:
  from app.database.client import get_supabase

  supabase = get_supabase()
  result = supabase.table("orders").select("*").execute()

LEARNING NOTE:
  The Supabase Python client wraps the PostgREST HTTP API.
  Every `.table().select().execute()` call makes an HTTP request to your
  Supabase project's auto-generated REST API endpoint.
"""

from supabase import create_client, Client
from app.config import get_settings

# Module-level singleton — created once, reused everywhere
_client: Client | None = None


def get_supabase() -> Client:
    """
    Return the shared Supabase client, creating it on first call.
    Raises ValueError if SUPABASE_URL or SUPABASE_KEY are not configured.
    """
    global _client

    if _client is None:
        settings = get_settings()

        if not settings.supabase_url or not settings.supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in backend/.env "
                "before the database can be used."
            )

        _client = create_client(settings.supabase_url, settings.supabase_key)

    return _client


def check_connection() -> bool:
    """
    Test whether the Supabase connection is working.
    Returns True if connected, False otherwise.
    Used by GET /api/v1/status for the frontend DB badge.
    """
    try:
        client = get_supabase()
        # A lightweight query — just check if the table exists and is reachable
        client.table("mcp_servers").select("id").limit(1).execute()
        return True
    except Exception:
        return False
