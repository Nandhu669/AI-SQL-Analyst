-- ============================================================
-- Complete Day 5 Migrations for AI SQL Analyst & Sandbox
-- 
-- HOW TO RUN:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/buaprpsizcvfztqcusim
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Paste this ENTIRE file and click "Run" (or Ctrl + Enter)
-- ============================================================

-- ── 1. Create mcp_queries table (Query History) ──────────────
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

CREATE INDEX IF NOT EXISTS idx_mcp_queries_created_at
  ON mcp_queries (created_at DESC);

-- ── 2. Create mcp_servers table (Server / Tool Status) ───────
CREATE TABLE IF NOT EXISTS mcp_servers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  server_name       TEXT        NOT NULL UNIQUE,
  connection_status TEXT        NOT NULL DEFAULT 'disconnected'
                    CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  last_ping         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO mcp_servers (server_name, connection_status, last_ping)
VALUES ('main-backend', 'connected', NOW())
ON CONFLICT (server_name) DO UPDATE
SET connection_status = 'connected', last_ping = NOW();

-- ── 3. Create query_audit_logs table (Safety Logs) ───────────
CREATE TABLE IF NOT EXISTS query_audit_logs (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id           UUID        REFERENCES mcp_queries(id) ON DELETE CASCADE,
  safety_check       BOOLEAN     NOT NULL DEFAULT FALSE,
  read_only_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  reason             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_query_id
  ON query_audit_logs (query_id);

-- ── 4. Create orders table & sample data ─────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID,
  product_name TEXT        NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'completed'
               CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO orders (product_name, amount, status, created_at) VALUES
  ('Laptop Pro',      48200.00, 'completed', NOW() - INTERVAL '2 days'),
  ('Wireless Mouse',  31500.00, 'completed', NOW() - INTERVAL '5 days'),
  ('USB Hub',         19800.00, 'completed', NOW() - INTERVAL '8 days'),
  ('Monitor 27"',     17200.00, 'completed', NOW() - INTERVAL '10 days'),
  ('Keyboard RGB',    14600.00, 'completed', NOW() - INTERVAL '12 days'),
  ('Webcam HD',       12300.00, 'completed', NOW() - INTERVAL '15 days'),
  ('Laptop Stand',     9800.00, 'completed', NOW() - INTERVAL '18 days'),
  ('Headphones',       8500.00, 'completed', NOW() - INTERVAL '20 days'),
  ('Mouse Pad XL',     4200.00, 'completed', NOW() - INTERVAL '22 days'),
  ('USB-C Cable',      1800.00, 'completed', NOW() - INTERVAL '25 days')
ON CONFLICT DO NOTHING;

-- ── 5. Create customers table & sample data ──────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  region     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO customers (name, email, region) VALUES
  ('Arjun Sharma',   'arjun@example.com',  'South India'),
  ('Priya Nair',     'priya@example.com',  'North India'),
  ('Ravi Kumar',     'ravi@example.com',   'West India'),
  ('Sneha Iyer',     'sneha@example.com',  'South India'),
  ('Karan Mehta',    'karan@example.com',  'North India')
ON CONFLICT (email) DO NOTHING;

-- ── 6. Schema Introspection View (for GET /api/v1/mcp/schema) 
CREATE OR REPLACE VIEW public_schema_columns AS
SELECT 
  table_name::text, 
  column_name::text, 
  data_type::text, 
  is_nullable::text
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT IN ('public_schema_columns');

-- ── 7. Read-Only SQL Execution Function (for POST /execute) ───
CREATE OR REPLACE FUNCTION execute_readonly_sql(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Strict safety gate: query must start with SELECT or WITH
  IF query_text !~* '^\s*(SELECT|WITH)' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed.';
  END IF;

  -- Block destructive keywords
  IF query_text ~* '\m(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE)\M' THEN
    RAISE EXCEPTION 'Destructive statements are forbidden.';
  END IF;

  EXECUTE format('SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (%s) t', query_text)
  INTO result;

  RETURN coalesce(result, '[]'::jsonb);
END;
$$;

-- ── 8. Permissions & RLS Configuration ───────────────────────
-- Allow read and write access for anon role on sandbox tables
ALTER TABLE mcp_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_servers DISABLE ROW LEVEL SECURITY;
ALTER TABLE query_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE mcp_queries TO anon, authenticated, service_role;
GRANT ALL ON TABLE mcp_servers TO anon, authenticated, service_role;
GRANT ALL ON TABLE query_audit_logs TO anon, authenticated, service_role;
GRANT SELECT ON TABLE orders TO anon, authenticated, service_role;
GRANT SELECT ON TABLE customers TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public_schema_columns TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION execute_readonly_sql(text) TO anon, authenticated, service_role;

-- ── Verify Execution ─────────────────────────────────────────
SELECT 'All migrations executed successfully! ✅' AS status,
       (SELECT COUNT(*) FROM orders) AS orders_count,
       (SELECT COUNT(*) FROM customers) AS customers_count,
       (SELECT COUNT(*) FROM mcp_servers) AS servers_count;
