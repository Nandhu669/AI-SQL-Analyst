"""
config.py — Application settings loaded from environment variables.

Uses pydantic-settings so every setting is typed and validated.
All values default to empty strings on Day 2 — the app starts without
any external services configured.

Day 3+: copy backend/.env.example → backend/.env and fill in values.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Supabase (required from Day 3 onwards) ────────────────────────────
    supabase_url: str = ""
    supabase_key: str = ""

    # ── OpenRouter LLM Gateway (required from Day 4 onwards) ──────────────
    openrouter_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",      # load from backend/.env if it exists
        extra="ignore",       # ignore any extra env vars silently
    )


# Single shared instance — import this everywhere: `from app.config import settings`
settings = Settings()
