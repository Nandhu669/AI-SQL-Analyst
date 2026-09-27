/**
 * health.ts — API call to the FastAPI health check endpoint.
 *
 * Why a dedicated module instead of inline fetch?
 * → Keeps the API URL in one place.
 * → Easy to swap the implementation later (e.g., add auth headers).
 *
 * VITE_API_BASE_URL is set in .env (copy from .env.example).
 * Falls back to http://localhost:8000 so the app works without a .env file.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export interface HealthResponse {
  status: string
}

/**
 * Call GET /healthz on the backend.
 * Throws an Error if the response is not HTTP 200.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/healthz`)
  if (!res.ok) {
    throw new Error(`Unexpected status: ${res.status}`)
  }
  return res.json() as Promise<HealthResponse>
}
