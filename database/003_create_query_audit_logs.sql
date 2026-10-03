-- ============================================================
-- Migration 003 — Create query_audit_logs table
-- Run this in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS query_audit_logs (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id           UUID        REFERENCES mcp_queries(id) ON DELETE CASCADE,
  safety_check       BOOLEAN     NOT NULL DEFAULT FALSE,
  read_only_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  reason             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index to quickly look up audit records for a specific query
CREATE INDEX IF NOT EXISTS idx_audit_logs_query_id
  ON query_audit_logs (query_id);

-- Verify
SELECT 'query_audit_logs created ✅' AS result;
