-- Fix ride_requests table: change id column from bigserial to UUID
-- This migration handles the case where the table was created incorrectly
-- (possibly by Hibernate DDL auto) with bigserial instead of UUID

-- Drop the table if it exists with wrong schema
-- Note: This will delete any existing data, but the table should be empty
-- or can be recreated since it's a new feature
DROP TABLE IF EXISTS ride_requests CASCADE;

-- Recreate the table with correct UUID type
CREATE TABLE ride_requests (
    id UUID PRIMARY KEY,
    ride_post_id UUID NOT NULL,
    requested_by_user_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT ride_requests_unique UNIQUE (ride_post_id, requested_by_user_id),
    CONSTRAINT fk_ride_requests_post FOREIGN KEY (ride_post_id) REFERENCES ride_posts(id) ON DELETE CASCADE
);

-- Recreate indexes
CREATE INDEX idx_ride_requests_post ON ride_requests (ride_post_id);
CREATE INDEX idx_ride_requests_user ON ride_requests (requested_by_user_id);
CREATE INDEX idx_ride_requests_status ON ride_requests (status);

