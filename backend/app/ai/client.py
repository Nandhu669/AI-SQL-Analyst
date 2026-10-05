"""
client.py — Asynchronous OpenRouter API client for free-tier LLM models.

Features:
  - Exclusively uses OpenRouter FREE models (:free suffix) per user constraint
  - Automatic fallback between active free models
  - Passes required OpenRouter headers (HTTP-Referer, X-Title)
"""

import httpx
from app.config import get_settings

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Prioritized list of active FREE models on OpenRouter
FREE_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "qwen/qwen3.8-27b:free",
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "liquid/lfm-2.5-2.6b:free",
    "cohere/north-mini-code:free",
]


async def call_openrouter(system_prompt: str, user_question: str) -> str:
    """
    Sends chat completion request to OpenRouter using free models with automatic failover.
    Returns the raw response text from the LLM.
    """
    settings = get_settings()
    api_key = settings.openrouter_api_key

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is missing. Please configure backend/.env.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI SQL Analyst & Sandbox",
    }

    # Try configured model first, followed by fallback free models
    preferred_model = settings.openrouter_model if ":free" in settings.openrouter_model else FREE_MODELS[0]
    candidate_models = [preferred_model] + [m for m in FREE_MODELS if m != preferred_model]

    last_error: Exception | None = None

    async with httpx.AsyncClient(timeout=35.0) as client:
        for model in candidate_models:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question},
                ],
                "temperature": 0.1,
                "max_tokens": 1200,
            }

            try:
                res = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        content = choices[0]["message"].get("content", "")
                        if content and len(content.strip()) > 0:
                            return content
                elif res.status_code in (404, 429):
                    # Model not available or rate limited, try next free model
                    continue
                else:
                    last_error = RuntimeError(
                        f"OpenRouter returned HTTP {res.status_code}: {res.text[:120]}"
                    )
            except Exception as e:
                last_error = e
                continue

    if last_error:
        raise last_error

    raise RuntimeError("All free OpenRouter candidate models were unavailable or rate-limited.")


async def check_openrouter_health() -> bool:
    """
    Checks if OpenRouter credentials are configured and reachable.
    """
    settings = get_settings()
    if not settings.openrouter_api_key:
        return False

    try:
        headers = {"Authorization": f"Bearer {settings.openrouter_api_key}"}
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get("https://openrouter.ai/api/v1/models", headers=headers)
            return res.status_code == 200
    except Exception:
        return bool(settings.openrouter_api_key and len(settings.openrouter_api_key) > 20)
