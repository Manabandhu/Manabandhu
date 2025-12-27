-- Add lease_extendable column to room_listings table
ALTER TABLE room_listings 
ADD COLUMN IF NOT EXISTS lease_extendable BOOLEAN NOT NULL DEFAULT false;

-- Add comment to document the column
COMMENT ON COLUMN room_listings.lease_extendable IS 'Indicates whether the lease can be extended by tenants';

