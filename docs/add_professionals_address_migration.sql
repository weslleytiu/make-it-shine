-- Add address fields to professionals (same structure as clients)
-- Run in Supabase SQL Editor

ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS address VARCHAR(500),
    ADD COLUMN IF NOT EXISTS postcode VARCHAR(20),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Optional: set NOT NULL with default for new rows (uncomment if you want required address)
-- UPDATE professionals SET address = '', postcode = '', city = '' WHERE address IS NULL;
-- ALTER TABLE professionals ALTER COLUMN address SET NOT NULL, ALTER COLUMN address SET DEFAULT '';
-- ALTER TABLE professionals ALTER COLUMN postcode SET NOT NULL, ALTER COLUMN postcode SET DEFAULT '';
-- ALTER TABLE professionals ALTER COLUMN city SET NOT NULL, ALTER COLUMN city SET DEFAULT '';
