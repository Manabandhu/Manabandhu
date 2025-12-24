CREATE TABLE IF NOT EXISTS ride_posts (
    id UUID PRIMARY KEY,
    post_type VARCHAR(20) NOT NULL,
    owner_user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    pickup_lat NUMERIC(10, 7) NOT NULL,
    pickup_lng NUMERIC(10, 7) NOT NULL,
    pickup_label VARCHAR(255) NOT NULL,
    drop_lat NUMERIC(10, 7) NOT NULL,
    drop_lng NUMERIC(10, 7) NOT NULL,
    drop_label VARCHAR(255) NOT NULL,
    route_distance_miles NUMERIC(8, 2) NOT NULL,
    route_polyline TEXT,
    depart_at TIMESTAMP NOT NULL,
    seats_total INTEGER,
    seats_needed INTEGER,
    requirements TEXT,
    pricing_mode VARCHAR(20) NOT NULL,
    price_fixed NUMERIC(10, 2),
    price_per_mile NUMERIC(10, 2),
    price_total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    booked_by_user_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    archived_at TIMESTAMP,
    version BIGINT
);

CREATE TABLE IF NOT EXISTS ride_post_activities (
    id UUID PRIMARY KEY,
    ride_post_id UUID NOT NULL,
    actor_user_id VARCHAR(255) NOT NULL,
    type VARCHAR(40) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS ride_conversation_links (
    id UUID PRIMARY KEY,
    ride_post_id UUID NOT NULL,
    owner_user_id VARCHAR(255) NOT NULL,
    other_user_id VARCHAR(255) NOT NULL,
    chat_thread_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    last_message_at TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT ride_conversation_links_unique UNIQUE (ride_post_id, owner_user_id, other_user_id)
);

CREATE TABLE IF NOT EXISTS ride_tracking_sessions (
    id UUID PRIMARY KEY,
    ride_post_id UUID NOT NULL,
    driver_user_id VARCHAR(255) NOT NULL,
    rider_user_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    last_location_at TIMESTAMP,
    last_lat NUMERIC(10, 7),
    last_lng NUMERIC(10, 7),
    eta_minutes INTEGER,
    distance_remaining_miles NUMERIC(8, 2)
);

CREATE INDEX IF NOT EXISTS idx_ride_posts_status ON ride_posts (status);
CREATE INDEX IF NOT EXISTS idx_ride_posts_owner ON ride_posts (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_ride_posts_expires ON ride_posts (expires_at);
