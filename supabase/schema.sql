-- Decisioning Console Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  active_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product versions table
CREATE TABLE IF NOT EXISTS product_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  UNIQUE(product_id, version)
);

-- Decisions table (immutable audit trail)
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  booking_ref TEXT NOT NULL,
  flight_no TEXT NOT NULL,
  flight_date DATE NOT NULL,
  passenger_token TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_version TEXT NOT NULL,
  product_hash TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('approved', 'denied')),
  payout_amount_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  reason_codes TEXT[] NOT NULL DEFAULT '{}',
  trace JSONB NOT NULL,
  flight_data JSONB NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log table (immutable)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'decision')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_versions_product_id ON product_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_decisions_product_id ON decisions(product_id);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);
CREATE INDEX IF NOT EXISTS idx_decisions_booking_ref ON decisions(booking_ref);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Row Level Security (RLS)
-- For now, allow all operations (no auth yet)
-- Enable RLS but with permissive policies

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all for now - tighten when auth is added)
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on product_versions" ON product_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on decisions" ON decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_log" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to products
DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed initial product (matches current mock data)
INSERT INTO products (id, name, description, status, active_version)
VALUES (
  'prod-eu-delay',
  'EU Flight Delay Standard',
  'Standard flight delay coverage for EU flights with tiered payouts',
  'active',
  'v1.2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_versions (product_id, version, hash, status, config, published_at)
VALUES (
  'prod-eu-delay',
  'v1.2',
  'a1b2c3d4',
  'published',
  '{
    "eligibility": {
      "claimWindowHours": 72
    },
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 60, "maxDelayMinutes": 120, "payoutUSD": 50},
      {"id": "tier-2", "minDelayMinutes": 121, "maxDelayMinutes": 240, "payoutUSD": 175},
      {"id": "tier-3", "minDelayMinutes": 241, "maxDelayMinutes": 480, "payoutUSD": 350},
      {"id": "tier-4", "minDelayMinutes": 481, "maxDelayMinutes": null, "payoutUSD": 600}
    ],
    "exclusions": [
      {"id": "excl-1", "name": "Force Majeure", "description": "Natural disasters, war, terrorism", "enabled": true},
      {"id": "excl-2", "name": "Acts of God", "description": "Extreme weather events beyond carrier control", "enabled": true}
    ]
  }'::jsonb,
  NOW()
) ON CONFLICT (product_id, version) DO NOTHING;

-- Add v1.1 for version comparison demo
INSERT INTO product_versions (product_id, version, hash, status, config, published_at)
VALUES (
  'prod-eu-delay',
  'v1.1',
  'e5f6g7h8',
  'published',
  '{
    "eligibility": {
      "claimWindowHours": 48
    },
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 60, "maxDelayMinutes": 120, "payoutUSD": 50},
      {"id": "tier-2", "minDelayMinutes": 121, "maxDelayMinutes": 240, "payoutUSD": 150},
      {"id": "tier-3", "minDelayMinutes": 241, "maxDelayMinutes": 480, "payoutUSD": 300},
      {"id": "tier-4", "minDelayMinutes": 481, "maxDelayMinutes": null, "payoutUSD": 500}
    ],
    "exclusions": [
      {"id": "excl-1", "name": "Force Majeure", "description": "Natural disasters, war, terrorism", "enabled": true},
      {"id": "excl-2", "name": "Acts of God", "description": "Extreme weather events beyond carrier control", "enabled": false}
    ]
  }'::jsonb,
  NOW() - INTERVAL '7 days'
) ON CONFLICT (product_id, version) DO NOTHING;
