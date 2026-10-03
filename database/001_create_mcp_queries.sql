-- ============================================================
-- Migration 001 — Create mcp_queries table
-- Run this in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS mcp_queries (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_prompt     TEXT        NOT NULL,
  generated_query TEXT,
  execution_time  INTEGER,              -- milliseconds
  row_count       INTEGER,
  status          TEXT        NOT NULL  DEFAULT 'pending'
                  CHECK (status IN ('pending', 'success', 'error')),
  created_at      TIMESTAMPTZ NOT NULL  DEFAULT NOW()
);

-- Index for fetching recent queries efficiently
CREATE INDEX IF NOT EXISTS idx_mcp_queries_created_at
  ON mcp_queries (created_at DESC);

-- Verify
SELECT 'mcp_queries created ✅' AS result;
