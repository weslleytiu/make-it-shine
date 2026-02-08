-- Payment Runs: bank details on professionals + payment_runs and payment_run_items
-- Run this in Supabase SQL Editor after the base schema and invoices are applied.

-- Add bank account columns to professionals (UK: name, sort code, account number)
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sort_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS account_number VARCHAR(20);

-- Payment runs: one run per period (e.g. monthly payroll)
CREATE TABLE IF NOT EXISTS payment_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- Payment run items: one row per professional to be paid in that run
CREATE TABLE IF NOT EXISTS payment_run_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_run_id UUID NOT NULL REFERENCES payment_runs(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  external_reference VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(payment_run_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_runs_period ON payment_runs(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payment_run_items_run_id ON payment_run_items(payment_run_id);
CREATE INDEX IF NOT EXISTS idx_payment_run_items_professional_id ON payment_run_items(professional_id);

-- RLS
ALTER TABLE payment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_run_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated on payment_runs"
  ON payment_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon on payment_runs"
  ON payment_runs FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on payment_run_items"
  ON payment_run_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon on payment_run_items"
  ON payment_run_items FOR ALL TO anon USING (true) WITH CHECK (true);
