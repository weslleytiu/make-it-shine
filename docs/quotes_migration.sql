-- Quotes table: landing page quote requests for approval and cleaner assignment
-- Run in Supabase SQL Editor after the main schema (clients, professionals, jobs)

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    preferred_contact VARCHAR(20) NOT NULL CHECK (preferred_contact IN ('Phone', 'WhatsApp', 'Email')),
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'landing-page',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_professional_id ON quotes(professional_id);

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users on quotes"
    ON quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users on quotes"
    ON quotes FOR ALL TO anon USING (true) WITH CHECK (true);
