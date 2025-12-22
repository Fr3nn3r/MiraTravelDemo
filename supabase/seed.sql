-- Seed data for Decisioning Console
-- This file populates the database with sample data matching the in-memory products.ts
-- Run with: supabase db reset (if using local) OR paste in Supabase SQL Editor

-- Clean existing data (order matters due to FK constraints)
DELETE FROM audit_log;
DELETE FROM decisions;
DELETE FROM product_versions;
DELETE FROM products;

-- ============================================================================
-- PRODUCTS
-- ============================================================================

INSERT INTO products (id, name, description, status, active_version, created_at, updated_at)
VALUES
  ('prod-eu-delay', 'Flight Delay Benefit - EU', 'Parametric flight arrival delay coverage for European routes', 'active', 'v1.2', '2024-10-01T08:00:00Z', '2024-12-15T14:00:00Z'),
  ('prod-us-delay', 'Flight Delay Benefit - US', 'Parametric flight arrival delay coverage for US domestic routes', 'active', 'v1.0', '2024-11-01T08:00:00Z', '2024-11-01T10:00:00Z'),
  ('prod-apac-delay', 'Flight Delay Benefit - APAC', 'Parametric flight arrival delay coverage for Asia-Pacific routes', 'draft', 'v0.1', '2024-12-10T08:00:00Z', '2024-12-10T08:00:00Z');

-- ============================================================================
-- PRODUCT VERSIONS
-- ============================================================================

-- EU Product v1.2 (current active)
INSERT INTO product_versions (product_id, version, hash, status, config, created_at, published_at)
VALUES (
  'prod-eu-delay',
  'v1.2',
  'a3f8c2d1',
  'published',
  '{
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 60, "maxDelayMinutes": 120, "payoutAmountUSD": 75},
      {"id": "tier-2", "minDelayMinutes": 121, "maxDelayMinutes": 240, "payoutAmountUSD": 175},
      {"id": "tier-3", "minDelayMinutes": 241, "maxDelayMinutes": 480, "payoutAmountUSD": 350},
      {"id": "tier-4", "minDelayMinutes": 481, "maxDelayMinutes": 9999, "payoutAmountUSD": 600}
    ],
    "eligibility": {
      "claimWindowHours": 72,
      "maxDaysToFile": 30
    },
    "exclusions": [
      {"id": "exc-1", "type": "weather", "label": "Weather-related delays", "enabled": false},
      {"id": "exc-2", "type": "carrier_cancellation", "label": "Carrier-initiated cancellations", "enabled": false},
      {"id": "exc-3", "type": "force_majeure", "label": "Force majeure / Acts of God", "enabled": true},
      {"id": "exc-4", "type": "crew_strike", "label": "Crew strikes", "enabled": false}
    ],
    "reasonCodes": [
      {"code": "APPROVED_TIER_1", "description": "Approved: Delay 1-2 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_2", "description": "Approved: Delay 2-4 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_3", "description": "Approved: Delay 4-8 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_4", "description": "Approved: Delay 8+ hours", "outcome": "approved"},
      {"code": "DENIED_NO_DELAY", "description": "Denied: No qualifying delay", "outcome": "denied"},
      {"code": "DENIED_OUTSIDE_WINDOW", "description": "Denied: Claim outside eligibility window", "outcome": "denied"},
      {"code": "DENIED_EXCLUSION", "description": "Denied: Exclusion applies", "outcome": "denied"},
      {"code": "DENIED_INVALID_FLIGHT", "description": "Denied: Flight data not found", "outcome": "denied"}
    ],
    "dataSource": {
      "type": "stub",
      "provider": "FlightAware (Stub)"
    }
  }'::jsonb,
  '2024-12-15T10:30:00Z',
  '2024-12-15T14:00:00Z'
);

-- EU Product v1.1 (older version)
INSERT INTO product_versions (product_id, version, hash, status, config, created_at, published_at)
VALUES (
  'prod-eu-delay',
  'v1.1',
  'b7e4f9a2',
  'published',
  '{
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 60, "maxDelayMinutes": 120, "payoutAmountUSD": 75},
      {"id": "tier-2", "minDelayMinutes": 121, "maxDelayMinutes": 240, "payoutAmountUSD": 150},
      {"id": "tier-3", "minDelayMinutes": 241, "maxDelayMinutes": 480, "payoutAmountUSD": 300},
      {"id": "tier-4", "minDelayMinutes": 481, "maxDelayMinutes": 9999, "payoutAmountUSD": 600}
    ],
    "eligibility": {
      "claimWindowHours": 72,
      "maxDaysToFile": 30
    },
    "exclusions": [
      {"id": "exc-1", "type": "weather", "label": "Weather-related delays", "enabled": false},
      {"id": "exc-2", "type": "carrier_cancellation", "label": "Carrier-initiated cancellations", "enabled": false},
      {"id": "exc-3", "type": "force_majeure", "label": "Force majeure / Acts of God", "enabled": true},
      {"id": "exc-4", "type": "crew_strike", "label": "Crew strikes", "enabled": true}
    ],
    "reasonCodes": [
      {"code": "APPROVED_TIER_1", "description": "Approved: Delay 1-2 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_2", "description": "Approved: Delay 2-4 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_3", "description": "Approved: Delay 4-8 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_4", "description": "Approved: Delay 8+ hours", "outcome": "approved"},
      {"code": "DENIED_NO_DELAY", "description": "Denied: No qualifying delay", "outcome": "denied"},
      {"code": "DENIED_OUTSIDE_WINDOW", "description": "Denied: Claim outside eligibility window", "outcome": "denied"},
      {"code": "DENIED_EXCLUSION", "description": "Denied: Exclusion applies", "outcome": "denied"},
      {"code": "DENIED_INVALID_FLIGHT", "description": "Denied: Flight data not found", "outcome": "denied"}
    ],
    "dataSource": {
      "type": "stub",
      "provider": "FlightAware (Stub)"
    }
  }'::jsonb,
  '2024-11-20T09:00:00Z',
  '2024-11-20T12:00:00Z'
);

-- EU Product v1.0 (oldest version)
INSERT INTO product_versions (product_id, version, hash, status, config, created_at, published_at)
VALUES (
  'prod-eu-delay',
  'v1.0',
  'c1d2e3f4',
  'published',
  '{
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 60, "maxDelayMinutes": 120, "payoutAmountUSD": 50},
      {"id": "tier-2", "minDelayMinutes": 121, "maxDelayMinutes": 240, "payoutAmountUSD": 100},
      {"id": "tier-3", "minDelayMinutes": 241, "maxDelayMinutes": 480, "payoutAmountUSD": 200},
      {"id": "tier-4", "minDelayMinutes": 481, "maxDelayMinutes": 9999, "payoutAmountUSD": 400}
    ],
    "eligibility": {
      "claimWindowHours": 72,
      "maxDaysToFile": 30
    },
    "exclusions": [
      {"id": "exc-1", "type": "weather", "label": "Weather-related delays", "enabled": false},
      {"id": "exc-2", "type": "carrier_cancellation", "label": "Carrier-initiated cancellations", "enabled": false},
      {"id": "exc-3", "type": "force_majeure", "label": "Force majeure / Acts of God", "enabled": true},
      {"id": "exc-4", "type": "crew_strike", "label": "Crew strikes", "enabled": true}
    ],
    "reasonCodes": [
      {"code": "APPROVED_TIER_1", "description": "Approved: Delay 1-2 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_2", "description": "Approved: Delay 2-4 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_3", "description": "Approved: Delay 4-8 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_4", "description": "Approved: Delay 8+ hours", "outcome": "approved"},
      {"code": "DENIED_NO_DELAY", "description": "Denied: No qualifying delay", "outcome": "denied"},
      {"code": "DENIED_OUTSIDE_WINDOW", "description": "Denied: Claim outside eligibility window", "outcome": "denied"},
      {"code": "DENIED_EXCLUSION", "description": "Denied: Exclusion applies", "outcome": "denied"},
      {"code": "DENIED_INVALID_FLIGHT", "description": "Denied: Flight data not found", "outcome": "denied"}
    ],
    "dataSource": {
      "type": "stub",
      "provider": "FlightAware (Stub)"
    }
  }'::jsonb,
  '2024-10-01T08:00:00Z',
  '2024-10-01T10:00:00Z'
);

-- US Product v1.0
INSERT INTO product_versions (product_id, version, hash, status, config, created_at, published_at)
VALUES (
  'prod-us-delay',
  'v1.0',
  'd4e5f6a7',
  'published',
  '{
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 60, "maxDelayMinutes": 120, "payoutAmountUSD": 50},
      {"id": "tier-2", "minDelayMinutes": 121, "maxDelayMinutes": 240, "payoutAmountUSD": 100},
      {"id": "tier-3", "minDelayMinutes": 241, "maxDelayMinutes": 480, "payoutAmountUSD": 200},
      {"id": "tier-4", "minDelayMinutes": 481, "maxDelayMinutes": 9999, "payoutAmountUSD": 400}
    ],
    "eligibility": {
      "claimWindowHours": 72,
      "maxDaysToFile": 30
    },
    "exclusions": [
      {"id": "exc-1", "type": "weather", "label": "Weather-related delays", "enabled": false},
      {"id": "exc-2", "type": "carrier_cancellation", "label": "Carrier-initiated cancellations", "enabled": false},
      {"id": "exc-3", "type": "force_majeure", "label": "Force majeure / Acts of God", "enabled": true},
      {"id": "exc-4", "type": "crew_strike", "label": "Crew strikes", "enabled": true}
    ],
    "reasonCodes": [
      {"code": "APPROVED_TIER_1", "description": "Approved: Delay 1-2 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_2", "description": "Approved: Delay 2-4 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_3", "description": "Approved: Delay 4-8 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_4", "description": "Approved: Delay 8+ hours", "outcome": "approved"},
      {"code": "DENIED_NO_DELAY", "description": "Denied: No qualifying delay", "outcome": "denied"},
      {"code": "DENIED_OUTSIDE_WINDOW", "description": "Denied: Claim outside eligibility window", "outcome": "denied"},
      {"code": "DENIED_EXCLUSION", "description": "Denied: Exclusion applies", "outcome": "denied"},
      {"code": "DENIED_INVALID_FLIGHT", "description": "Denied: Flight data not found", "outcome": "denied"}
    ],
    "dataSource": {
      "type": "stub",
      "provider": "FlightAware (Stub)"
    }
  }'::jsonb,
  '2024-11-01T08:00:00Z',
  '2024-11-01T10:00:00Z'
);

-- APAC Product v0.1 (draft)
INSERT INTO product_versions (product_id, version, hash, status, config, created_at, published_at)
VALUES (
  'prod-apac-delay',
  'v0.1',
  'e8f9a0b1',
  'draft',
  '{
    "payoutTiers": [
      {"id": "tier-1", "minDelayMinutes": 90, "maxDelayMinutes": 180, "payoutAmountUSD": 40},
      {"id": "tier-2", "minDelayMinutes": 181, "maxDelayMinutes": 360, "payoutAmountUSD": 80},
      {"id": "tier-3", "minDelayMinutes": 361, "maxDelayMinutes": 9999, "payoutAmountUSD": 150}
    ],
    "eligibility": {
      "claimWindowHours": 72,
      "maxDaysToFile": 30
    },
    "exclusions": [
      {"id": "exc-1", "type": "weather", "label": "Weather-related delays", "enabled": false},
      {"id": "exc-2", "type": "carrier_cancellation", "label": "Carrier-initiated cancellations", "enabled": false},
      {"id": "exc-3", "type": "force_majeure", "label": "Force majeure / Acts of God", "enabled": true},
      {"id": "exc-4", "type": "crew_strike", "label": "Crew strikes", "enabled": true}
    ],
    "reasonCodes": [
      {"code": "APPROVED_TIER_1", "description": "Approved: Delay 1.5-3 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_2", "description": "Approved: Delay 3-6 hours", "outcome": "approved"},
      {"code": "APPROVED_TIER_3", "description": "Approved: Delay 6+ hours", "outcome": "approved"},
      {"code": "DENIED_NO_DELAY", "description": "Denied: No qualifying delay", "outcome": "denied"},
      {"code": "DENIED_OUTSIDE_WINDOW", "description": "Denied: Claim outside eligibility window", "outcome": "denied"},
      {"code": "DENIED_EXCLUSION", "description": "Denied: Exclusion applies", "outcome": "denied"},
      {"code": "DENIED_INVALID_FLIGHT", "description": "Denied: Flight data not found", "outcome": "denied"}
    ],
    "dataSource": {
      "type": "stub",
      "provider": "FlightAware (Stub)"
    }
  }'::jsonb,
  '2024-12-10T08:00:00Z',
  NULL
);

-- ============================================================================
-- SAMPLE DECISIONS (for metrics dashboard)
-- ============================================================================

-- Generate sample decisions for the last 30 days
INSERT INTO decisions (id, booking_ref, flight_no, flight_date, passenger_token, product_id, product_version, product_hash, outcome, payout_amount_usd, reason_codes, trace, flight_data, processing_time_ms, created_at)
VALUES
  -- Approved claims (various tiers)
  ('DEC-SAMPLE-001', 'BK-20241201-001', 'BA123', '2024-12-01', 'pax-token-001', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 175, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "BA123", "flightDate": "2024-12-01", "status": "delayed", "delayMinutes": 150, "delayReason": "operational"}'::jsonb, 45, '2024-12-01T14:30:00Z'),
  ('DEC-SAMPLE-002', 'BK-20241202-001', 'LH456', '2024-12-02', 'pax-token-002', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 350, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "LH456", "flightDate": "2024-12-02", "status": "delayed", "delayMinutes": 300, "delayReason": "operational"}'::jsonb, 52, '2024-12-02T16:45:00Z'),
  ('DEC-SAMPLE-003', 'BK-20241203-001', 'AF789', '2024-12-03', 'pax-token-003', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 75, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "AF789", "flightDate": "2024-12-03", "status": "delayed", "delayMinutes": 90, "delayReason": "weather"}'::jsonb, 38, '2024-12-03T10:20:00Z'),
  ('DEC-SAMPLE-004', 'BK-20241205-001', 'BA234', '2024-12-05', 'pax-token-004', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 600, ARRAY['APPROVED_TIER_4'], '[]'::jsonb, '{"flightNo": "BA234", "flightDate": "2024-12-05", "status": "delayed", "delayMinutes": 540, "delayReason": "operational"}'::jsonb, 61, '2024-12-05T22:10:00Z'),
  ('DEC-SAMPLE-005', 'BK-20241207-001', 'LH789', '2024-12-07', 'pax-token-005', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 175, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "LH789", "flightDate": "2024-12-07", "status": "delayed", "delayMinutes": 180, "delayReason": "operational"}'::jsonb, 42, '2024-12-07T08:30:00Z'),
  ('DEC-SAMPLE-006', 'BK-20241210-001', 'AF123', '2024-12-10', 'pax-token-006', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 75, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "AF123", "flightDate": "2024-12-10", "status": "delayed", "delayMinutes": 75, "delayReason": "weather"}'::jsonb, 35, '2024-12-10T12:00:00Z'),
  ('DEC-SAMPLE-007', 'BK-20241212-001', 'BA567', '2024-12-12', 'pax-token-007', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 350, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "BA567", "flightDate": "2024-12-12", "status": "delayed", "delayMinutes": 280, "delayReason": "operational"}'::jsonb, 48, '2024-12-12T18:45:00Z'),
  ('DEC-SAMPLE-008', 'BK-20241215-001', 'LH234', '2024-12-15', 'pax-token-008', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 175, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "LH234", "flightDate": "2024-12-15", "status": "delayed", "delayMinutes": 200, "delayReason": "operational"}'::jsonb, 55, '2024-12-15T14:20:00Z'),

  -- Denied claims
  ('DEC-SAMPLE-009', 'BK-20241204-001', 'KL500', '2024-12-04', 'pax-token-009', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'denied', 0, ARRAY['DENIED_NO_DELAY'], '[]'::jsonb, '{"flightNo": "KL500", "flightDate": "2024-12-04", "status": "on_time", "delayMinutes": 0, "delayReason": "none"}'::jsonb, 28, '2024-12-04T09:00:00Z'),
  ('DEC-SAMPLE-010', 'BK-20241206-001', 'DL300', '2024-12-06', 'pax-token-010', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'denied', 0, ARRAY['DENIED_EXCLUSION'], '[]'::jsonb, '{"flightNo": "DL300", "flightDate": "2024-12-06", "status": "delayed", "delayMinutes": 180, "delayReason": "force_majeure"}'::jsonb, 33, '2024-12-06T11:30:00Z'),
  ('DEC-SAMPLE-011', 'BK-20241208-001', 'SK600', '2024-12-08', 'pax-token-011', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'denied', 0, ARRAY['DENIED_NO_DELAY'], '[]'::jsonb, '{"flightNo": "SK600", "flightDate": "2024-12-08", "status": "delayed", "delayMinutes": 45, "delayReason": "operational"}'::jsonb, 31, '2024-12-08T15:15:00Z'),
  ('DEC-SAMPLE-012', 'BK-20241211-001', 'INVALID999', '2024-12-11', 'pax-token-012', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'denied', 0, ARRAY['DENIED_INVALID_FLIGHT'], '[]'::jsonb, '{"flightNo": "INVALID999", "flightDate": "2024-12-11", "status": "unknown", "delayMinutes": 0, "delayReason": "none"}'::jsonb, 25, '2024-12-11T10:00:00Z'),

  -- More approved for good approval rate
  ('DEC-SAMPLE-013', 'BK-20241216-001', 'AF456', '2024-12-16', 'pax-token-013', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 175, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "AF456", "flightDate": "2024-12-16", "status": "delayed", "delayMinutes": 165, "delayReason": "operational"}'::jsonb, 44, '2024-12-16T13:30:00Z'),
  ('DEC-SAMPLE-014', 'BK-20241218-001', 'BA890', '2024-12-18', 'pax-token-014', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 75, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "BA890", "flightDate": "2024-12-18", "status": "delayed", "delayMinutes": 85, "delayReason": "weather"}'::jsonb, 39, '2024-12-18T17:45:00Z'),
  ('DEC-SAMPLE-015', 'BK-20241220-001', 'LH567', '2024-12-20', 'pax-token-015', 'prod-eu-delay', 'v1.2', 'a3f8c2d1', 'approved', 350, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "LH567", "flightDate": "2024-12-20", "status": "delayed", "delayMinutes": 320, "delayReason": "operational"}'::jsonb, 57, '2024-12-20T20:00:00Z');

-- ============================================================================
-- US PRODUCT DECISIONS
-- ============================================================================

INSERT INTO decisions (id, booking_ref, flight_no, flight_date, passenger_token, product_id, product_version, product_hash, outcome, payout_amount_usd, reason_codes, trace, flight_data, processing_time_ms, created_at)
VALUES
  -- US Approved claims
  ('DEC-US-001', 'BK-US-20241201-001', 'AA100', '2024-12-01', 'pax-us-001', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 100, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "AA100", "flightDate": "2024-12-01", "status": "delayed", "delayMinutes": 145, "delayReason": "operational"}'::jsonb, 41, '2024-12-01T16:30:00Z'),
  ('DEC-US-002', 'BK-US-20241203-001', 'UA500', '2024-12-03', 'pax-us-002', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 200, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "UA500", "flightDate": "2024-12-03", "status": "delayed", "delayMinutes": 290, "delayReason": "weather"}'::jsonb, 49, '2024-12-03T19:45:00Z'),
  ('DEC-US-003', 'BK-US-20241205-001', 'DL200', '2024-12-05', 'pax-us-003', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 50, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "DL200", "flightDate": "2024-12-05", "status": "delayed", "delayMinutes": 75, "delayReason": "operational"}'::jsonb, 36, '2024-12-05T11:20:00Z'),
  ('DEC-US-004', 'BK-US-20241208-001', 'AA250', '2024-12-08', 'pax-us-004', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 400, ARRAY['APPROVED_TIER_4'], '[]'::jsonb, '{"flightNo": "AA250", "flightDate": "2024-12-08", "status": "delayed", "delayMinutes": 510, "delayReason": "operational"}'::jsonb, 58, '2024-12-08T23:10:00Z'),
  ('DEC-US-005', 'BK-US-20241210-001', 'UA750', '2024-12-10', 'pax-us-005', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 100, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "UA750", "flightDate": "2024-12-10", "status": "delayed", "delayMinutes": 160, "delayReason": "operational"}'::jsonb, 43, '2024-12-10T14:00:00Z'),
  ('DEC-US-006', 'BK-US-20241212-001', 'DL450', '2024-12-12', 'pax-us-006', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 50, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "DL450", "flightDate": "2024-12-12", "status": "delayed", "delayMinutes": 68, "delayReason": "weather"}'::jsonb, 34, '2024-12-12T09:30:00Z'),
  ('DEC-US-007', 'BK-US-20241215-001', 'AA800', '2024-12-15', 'pax-us-007', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 200, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "AA800", "flightDate": "2024-12-15", "status": "delayed", "delayMinutes": 350, "delayReason": "operational"}'::jsonb, 51, '2024-12-15T18:45:00Z'),
  ('DEC-US-008', 'BK-US-20241218-001', 'UA300', '2024-12-18', 'pax-us-008', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 100, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "UA300", "flightDate": "2024-12-18", "status": "delayed", "delayMinutes": 185, "delayReason": "operational"}'::jsonb, 46, '2024-12-18T21:00:00Z'),

  -- US Denied claims
  ('DEC-US-009', 'BK-US-20241202-001', 'SW100', '2024-12-02', 'pax-us-009', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'denied', 0, ARRAY['DENIED_NO_DELAY'], '[]'::jsonb, '{"flightNo": "SW100", "flightDate": "2024-12-02", "status": "on_time", "delayMinutes": 15, "delayReason": "none"}'::jsonb, 26, '2024-12-02T08:00:00Z'),
  ('DEC-US-010', 'BK-US-20241207-001', 'AA999', '2024-12-07', 'pax-us-010', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'denied', 0, ARRAY['DENIED_EXCLUSION'], '[]'::jsonb, '{"flightNo": "AA999", "flightDate": "2024-12-07", "status": "delayed", "delayMinutes": 200, "delayReason": "crew_strike"}'::jsonb, 32, '2024-12-07T13:15:00Z'),
  ('DEC-US-011', 'BK-US-20241214-001', 'DL777', '2024-12-14', 'pax-us-011', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'denied', 0, ARRAY['DENIED_NO_DELAY'], '[]'::jsonb, '{"flightNo": "DL777", "flightDate": "2024-12-14", "status": "delayed", "delayMinutes": 55, "delayReason": "operational"}'::jsonb, 29, '2024-12-14T16:30:00Z'),

  -- More US approved for good metrics
  ('DEC-US-012', 'BK-US-20241219-001', 'DL600', '2024-12-19', 'pax-us-012', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 50, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "DL600", "flightDate": "2024-12-19", "status": "delayed", "delayMinutes": 95, "delayReason": "weather"}'::jsonb, 37, '2024-12-19T10:15:00Z'),
  ('DEC-US-013', 'BK-US-20241220-001', 'UA850', '2024-12-20', 'pax-us-013', 'prod-us-delay', 'v1.0', 'd4e5f6a7', 'approved', 200, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "UA850", "flightDate": "2024-12-20", "status": "delayed", "delayMinutes": 310, "delayReason": "operational"}'::jsonb, 53, '2024-12-20T22:30:00Z');

-- ============================================================================
-- ADDITIONAL EU DECISIONS (older dates for trend data)
-- ============================================================================

INSERT INTO decisions (id, booking_ref, flight_no, flight_date, passenger_token, product_id, product_version, product_hash, outcome, payout_amount_usd, reason_codes, trace, flight_data, processing_time_ms, created_at)
VALUES
  -- November EU decisions (v1.1)
  ('DEC-EU-NOV-001', 'BK-20241105-001', 'BA200', '2024-11-05', 'pax-nov-001', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'approved', 150, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "BA200", "flightDate": "2024-11-05", "status": "delayed", "delayMinutes": 140, "delayReason": "operational"}'::jsonb, 44, '2024-11-05T12:30:00Z'),
  ('DEC-EU-NOV-002', 'BK-20241108-001', 'LH300', '2024-11-08', 'pax-nov-002', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'approved', 75, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "LH300", "flightDate": "2024-11-08", "status": "delayed", "delayMinutes": 80, "delayReason": "weather"}'::jsonb, 38, '2024-11-08T15:45:00Z'),
  ('DEC-EU-NOV-003', 'BK-20241112-001', 'AF200', '2024-11-12', 'pax-nov-003', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'approved', 300, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "AF200", "flightDate": "2024-11-12", "status": "delayed", "delayMinutes": 270, "delayReason": "operational"}'::jsonb, 52, '2024-11-12T18:20:00Z'),
  ('DEC-EU-NOV-004', 'BK-20241115-001', 'KL400', '2024-11-15', 'pax-nov-004', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'denied', 0, ARRAY['DENIED_NO_DELAY'], '[]'::jsonb, '{"flightNo": "KL400", "flightDate": "2024-11-15", "status": "on_time", "delayMinutes": 20, "delayReason": "none"}'::jsonb, 27, '2024-11-15T09:00:00Z'),
  ('DEC-EU-NOV-005', 'BK-20241118-001', 'BA350', '2024-11-18', 'pax-nov-005', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'approved', 600, ARRAY['APPROVED_TIER_4'], '[]'::jsonb, '{"flightNo": "BA350", "flightDate": "2024-11-18", "status": "delayed", "delayMinutes": 600, "delayReason": "operational"}'::jsonb, 62, '2024-11-18T21:00:00Z'),
  ('DEC-EU-NOV-006', 'BK-20241122-001', 'LH450', '2024-11-22', 'pax-nov-006', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'approved', 150, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "LH450", "flightDate": "2024-11-22", "status": "delayed", "delayMinutes": 175, "delayReason": "operational"}'::jsonb, 45, '2024-11-22T14:30:00Z'),
  ('DEC-EU-NOV-007', 'BK-20241125-001', 'AF350', '2024-11-25', 'pax-nov-007', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'denied', 0, ARRAY['DENIED_EXCLUSION'], '[]'::jsonb, '{"flightNo": "AF350", "flightDate": "2024-11-25", "status": "delayed", "delayMinutes": 250, "delayReason": "crew_strike"}'::jsonb, 35, '2024-11-25T11:15:00Z'),
  ('DEC-EU-NOV-008', 'BK-20241128-001', 'SK200', '2024-11-28', 'pax-nov-008', 'prod-eu-delay', 'v1.1', 'b7e4f9a2', 'approved', 75, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "SK200", "flightDate": "2024-11-28", "status": "delayed", "delayMinutes": 90, "delayReason": "weather"}'::jsonb, 40, '2024-11-28T16:45:00Z'),

  -- October EU decisions (v1.0)
  ('DEC-EU-OCT-001', 'BK-20241010-001', 'BA100', '2024-10-10', 'pax-oct-001', 'prod-eu-delay', 'v1.0', 'c1d2e3f4', 'approved', 100, ARRAY['APPROVED_TIER_2'], '[]'::jsonb, '{"flightNo": "BA100", "flightDate": "2024-10-10", "status": "delayed", "delayMinutes": 130, "delayReason": "operational"}'::jsonb, 43, '2024-10-10T10:30:00Z'),
  ('DEC-EU-OCT-002', 'BK-20241015-001', 'LH100', '2024-10-15', 'pax-oct-002', 'prod-eu-delay', 'v1.0', 'c1d2e3f4', 'approved', 50, ARRAY['APPROVED_TIER_1'], '[]'::jsonb, '{"flightNo": "LH100", "flightDate": "2024-10-15", "status": "delayed", "delayMinutes": 70, "delayReason": "weather"}'::jsonb, 36, '2024-10-15T13:45:00Z'),
  ('DEC-EU-OCT-003', 'BK-20241020-001', 'AF100', '2024-10-20', 'pax-oct-003', 'prod-eu-delay', 'v1.0', 'c1d2e3f4', 'approved', 200, ARRAY['APPROVED_TIER_3'], '[]'::jsonb, '{"flightNo": "AF100", "flightDate": "2024-10-20", "status": "delayed", "delayMinutes": 320, "delayReason": "operational"}'::jsonb, 55, '2024-10-20T17:00:00Z'),
  ('DEC-EU-OCT-004', 'BK-20241025-001', 'KL100', '2024-10-25', 'pax-oct-004', 'prod-eu-delay', 'v1.0', 'c1d2e3f4', 'denied', 0, ARRAY['DENIED_NO_DELAY'], '[]'::jsonb, '{"flightNo": "KL100", "flightDate": "2024-10-25", "status": "delayed", "delayMinutes": 50, "delayReason": "operational"}'::jsonb, 28, '2024-10-25T08:30:00Z'),
  ('DEC-EU-OCT-005', 'BK-20241028-001', 'BA150', '2024-10-28', 'pax-oct-005', 'prod-eu-delay', 'v1.0', 'c1d2e3f4', 'approved', 400, ARRAY['APPROVED_TIER_4'], '[]'::jsonb, '{"flightNo": "BA150", "flightDate": "2024-10-28", "status": "delayed", "delayMinutes": 520, "delayReason": "operational"}'::jsonb, 59, '2024-10-28T20:15:00Z');

-- ============================================================================
-- AUDIT LOG ENTRIES
-- ============================================================================

INSERT INTO audit_log (entity_type, entity_id, action, actor, details, created_at)
VALUES
  -- Product lifecycle events
  ('product', 'prod-eu-delay', 'CREATED', 'system', '{"source": "seed"}'::jsonb, '2024-10-01T08:00:00Z'),
  ('product', 'prod-eu-delay', 'VERSION_PUBLISHED', 'Demo User', '{"version": "v1.0"}'::jsonb, '2024-10-01T10:00:00Z'),
  ('product', 'prod-eu-delay', 'CONFIG_UPDATED', 'Demo User', '{"field": "payoutTiers", "change": "Increased tier payouts"}'::jsonb, '2024-11-20T09:00:00Z'),
  ('product', 'prod-eu-delay', 'VERSION_PUBLISHED', 'Demo User', '{"version": "v1.1"}'::jsonb, '2024-11-20T12:00:00Z'),
  ('product', 'prod-eu-delay', 'CONFIG_UPDATED', 'Demo User', '{"field": "exclusions", "change": "Disabled crew_strike exclusion"}'::jsonb, '2024-12-15T10:00:00Z'),
  ('product', 'prod-eu-delay', 'VERSION_PUBLISHED', 'Demo User', '{"version": "v1.2"}'::jsonb, '2024-12-15T14:00:00Z'),

  ('product', 'prod-us-delay', 'CREATED', 'system', '{"source": "seed"}'::jsonb, '2024-11-01T08:00:00Z'),
  ('product', 'prod-us-delay', 'VERSION_PUBLISHED', 'Demo User', '{"version": "v1.0"}'::jsonb, '2024-11-01T10:00:00Z'),

  ('product', 'prod-apac-delay', 'CREATED', 'system', '{"source": "seed"}'::jsonb, '2024-12-10T08:00:00Z'),
  ('product', 'prod-apac-delay', 'CONFIG_UPDATED', 'Demo User', '{"field": "payoutTiers", "change": "Adjusted APAC-specific tiers"}'::jsonb, '2024-12-12T14:30:00Z'),

  -- Decision audit entries (sample of important decisions)
  ('decision', 'DEC-SAMPLE-004', 'DECISION_MADE', 'system', '{"outcome": "approved", "tier": 4, "payout": 600}'::jsonb, '2024-12-05T22:10:00Z'),
  ('decision', 'DEC-US-004', 'DECISION_MADE', 'system', '{"outcome": "approved", "tier": 4, "payout": 400}'::jsonb, '2024-12-08T23:10:00Z'),
  ('decision', 'DEC-SAMPLE-010', 'DECISION_MADE', 'system', '{"outcome": "denied", "reason": "force_majeure exclusion"}'::jsonb, '2024-12-06T11:30:00Z'),
  ('decision', 'DEC-EU-NOV-005', 'DECISION_MADE', 'system', '{"outcome": "approved", "tier": 4, "payout": 600}'::jsonb, '2024-11-18T21:00:00Z');
