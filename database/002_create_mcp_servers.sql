-- ============================================================
-- Migration 002 — Create mcp_servers table
-- Run this in Supabase: Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS mcp_servers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  server_name       TEXT        NOT NULL UNIQUE,
  connection_status TEXT        NOT NULL DEFAULT 'disconnected'
                    CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  last_ping         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the backend server record
INSERT INTO mcp_servers (server_name, connection_status)
VALUES ('main-backend', 'connected')
ON CONFLICT (server_name) DO NOTHING;

-- Verify
SELECT 'mcp_servers created ✅' AS result;
