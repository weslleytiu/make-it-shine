-- Service types (Regular vs Deep clean): pricing and cost
-- Run in Supabase SQL Editor after the main schema and invoice migration.

-- Client: optional deep clean price per hour
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS deep_clean_price_per_hour DECIMAL(10, 2) CHECK (deep_clean_price_per_hour IS NULL OR deep_clean_price_per_hour > 0);

-- Professional: optional deep clean rate per hour
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS deep_clean_rate_per_hour DECIMAL(10, 2) CHECK (deep_clean_rate_per_hour IS NULL OR deep_clean_rate_per_hour > 0);

-- Job: service kind (regular vs deep_clean)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS service_kind VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (service_kind IN ('regular', 'deep_clean'));

-- Backfill existing rows so service_kind is set (default already applied by DEFAULT above)
-- No extra backfill needed.
