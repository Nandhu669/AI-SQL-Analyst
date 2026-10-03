-- ============================================================
-- Migration 004 — Create sample orders & customers + seed data
-- Run this in Supabase: Dashboard → SQL Editor → New query
-- ============================================================
-- These are the tables the stub SQL in /query already references.
-- After this migration, /execute will return REAL rows.

-- orders table
CREATE TABLE IF NOT EXISTS orders (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID,
  product_name TEXT        NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'completed'
               CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- customers table
CREATE TABLE IF NOT EXISTS customers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  region     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed 10 sample orders ────────────────────────────────────────────────────
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

-- ── Seed 5 sample customers ──────────────────────────────────────────────────
INSERT INTO customers (name, email, region) VALUES
  ('Arjun Sharma',   'arjun@example.com',  'South India'),
  ('Priya Nair',     'priya@example.com',  'North India'),
  ('Ravi Kumar',     'ravi@example.com',   'West India'),
  ('Sneha Iyer',     'sneha@example.com',  'South India'),
  ('Karan Mehta',    'karan@example.com',  'North India')
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT 'Sample data seeded ✅' AS result;
SELECT COUNT(*) AS order_count FROM orders;
SELECT COUNT(*) AS customer_count FROM customers;
