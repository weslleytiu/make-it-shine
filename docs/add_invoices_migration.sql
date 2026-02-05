-- Invoice tables and client invoice configuration
-- Run this in Supabase SQL Editor after the initial schema (supabase-migration.sql) is applied.

-- Add invoice configuration columns to clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS invoice_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (invoice_frequency IN ('per_job', 'weekly', 'biweekly', 'monthly', 'manual')),
  ADD COLUMN IF NOT EXISTS invoice_day_of_month INTEGER CHECK (invoice_day_of_month IS NULL OR (invoice_day_of_month >= 1 AND invoice_day_of_month <= 31)),
  ADD COLUMN IF NOT EXISTS invoice_day_of_week INTEGER CHECK (invoice_day_of_week IS NULL OR (invoice_day_of_week >= 0 AND invoice_day_of_week <= 6)),
  ADD COLUMN IF NOT EXISTS auto_generate_invoice BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS invoice_notes TEXT;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice <-> Jobs link table
CREATE TABLE IF NOT EXISTS invoice_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invoice_id, job_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoice_jobs_invoice_id ON invoice_jobs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_jobs_job_id ON invoice_jobs(job_id);

-- Trigger for updated_at on invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated on invoices"
  ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon on invoices"
  ON invoices FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on invoice_jobs"
  ON invoice_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon on invoice_jobs"
  ON invoice_jobs FOR ALL TO anon USING (true) WITH CHECK (true);
