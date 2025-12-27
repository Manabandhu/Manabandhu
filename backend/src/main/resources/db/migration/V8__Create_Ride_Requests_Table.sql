CREATE TABLE IF NOT EXISTS ride_requests (
    id UUID PRIMARY KEY,
    ride_post_id UUID NOT NULL,
    requested_by_user_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT ride_requests_unique UNIQUE (ride_post_id, requested_by_user_id),
    CONSTRAINT fk_ride_requests_post FOREIGN KEY (ride_post_id) REFERENCES ride_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ride_requests_post ON ride_requests (ride_post_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_user ON ride_requests (requested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests (status);

