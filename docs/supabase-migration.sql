-- Supabase Migration: CRM Antigravity Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('residential', 'commercial')),
    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('fixed', 'on_demand')),
    frequency VARCHAR(20) CHECK (frequency IN ('weekly', 'biweekly', 'triweekly', 'monthly')),
    price_per_hour DECIMAL(10, 2) NOT NULL CHECK (price_per_hour > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create professionals table
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rate_per_hour DECIMAL(10, 2) NOT NULL CHECK (rate_per_hour > 0),
    availability JSONB NOT NULL DEFAULT '{"mon": false, "tue": false, "wed": false, "thu": false, "fri": false, "sat": false, "sun": false}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacation', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL CHECK (duration_hours >= 0.5),
    type VARCHAR(20) NOT NULL CHECK (type IN ('one_time', 'recurring')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    total_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    recurring_group_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_professional_id ON jobs(professional_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_professionals_status ON professionals(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- For now, allow all operations for authenticated users
-- In the future, you can add user-specific policies

-- Clients policies
CREATE POLICY "Allow all operations for authenticated users on clients"
    ON clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Professionals policies
CREATE POLICY "Allow all operations for authenticated users on professionals"
    ON professionals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Jobs policies
CREATE POLICY "Allow all operations for authenticated users on jobs"
    ON jobs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- For development/testing: Allow all operations without authentication
-- Remove these policies in production!
CREATE POLICY "Allow all operations for anon users on clients"
    ON clients
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users on professionals"
    ON professionals
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users on jobs"
    ON jobs
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
