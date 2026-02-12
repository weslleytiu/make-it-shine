-- Multiple professionals per job
-- Run in Supabase SQL Editor after the main schema. Allows a client job to have more than one professional.

-- Junction table: job_id + professional_id + cost (each pro's share for payment runs)
CREATE TABLE IF NOT EXISTS job_professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_job_professionals_job_id ON job_professionals(job_id);
CREATE INDEX IF NOT EXISTS idx_job_professionals_professional_id ON job_professionals(professional_id);

-- Migrate existing data: one row per current job with its single professional
INSERT INTO job_professionals (job_id, professional_id, cost)
SELECT id, professional_id, COALESCE(cost, 0)
FROM jobs
WHERE professional_id IS NOT NULL
ON CONFLICT (job_id, professional_id) DO NOTHING;

-- Drop the single professional_id column from jobs
ALTER TABLE jobs DROP COLUMN IF EXISTS professional_id;

-- RLS for job_professionals (match jobs policy)
ALTER TABLE job_professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users on job_professionals"
    ON job_professionals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
