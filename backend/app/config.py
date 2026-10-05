"""
config.py — Application settings loaded from environment variables.

Uses pydantic-settings so every setting is typed and validated.
Values default to empty strings — the app starts without external services
but raises clear errors if a feature is used without its credentials.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Supabase (Day 5 onwards) ─────────────────────────────────────────────
    supabase_url: str = ""
    supabase_key: str = ""

    # ── OpenRouter LLM Gateway (Day 7 AI Integration) ────────────────────────
    openrouter_api_key: str = ""
    # Only free models (:free suffix) per user constraint
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free"

    model_config = SettingsConfigDict(
        env_file=".env",    # load from backend/.env if it exists
        extra="ignore",     # ignore any extra env vars silently
    )


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings instance.
    Using lru_cache means settings are only loaded once per process.
    """
    return Settings()
