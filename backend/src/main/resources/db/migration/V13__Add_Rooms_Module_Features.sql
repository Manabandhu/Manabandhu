-- Migration: Add Rooms Module Features
-- Description: Creates tables for saved listings, view tracking, price alerts, and reporting

-- Table: saved_listings
CREATE TABLE IF NOT EXISTS saved_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    listing_id UUID NOT NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT uk_saved_listings_user_listing UNIQUE (user_id, listing_id),
    CONSTRAINT fk_saved_listings_listing FOREIGN KEY (listing_id) REFERENCES room_listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON saved_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_saved_at ON saved_listings(saved_at DESC);

-- Table: listing_views
CREATE TABLE IF NOT EXISTS listing_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    user_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_views_listing FOREIGN KEY (listing_id) REFERENCES room_listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_user_id ON listing_views(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewed_at ON listing_views(viewed_at);

-- Table: price_alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    max_rent NUMERIC(19, 2),
    min_rent NUMERIC(19, 2),
    room_type VARCHAR(50),
    listing_for VARCHAR(50),
    available_by DATE,
    min_lat NUMERIC(10, 7),
    max_lat NUMERIC(10, 7),
    min_lng NUMERIC(10, 7),
    max_lng NUMERIC(10, 7),
    area_label VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    last_notified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_price_alerts_created_at ON price_alerts(created_at DESC);

-- Table: price_alert_amenities
CREATE TABLE IF NOT EXISTS price_alert_amenities (
    alert_id UUID NOT NULL,
    amenity VARCHAR(255) NOT NULL,
    CONSTRAINT fk_price_alert_amenities_alert FOREIGN KEY (alert_id) REFERENCES price_alerts(id) ON DELETE CASCADE,
    PRIMARY KEY (alert_id, amenity)
);

-- Table: listing_reports
CREATE TABLE IF NOT EXISTS listing_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    reporter_user_id VARCHAR(255) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_reports_listing FOREIGN KEY (listing_id) REFERENCES room_listings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_user_id ON listing_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON listing_reports(status);
CREATE INDEX IF NOT EXISTS idx_listing_reports_created_at ON listing_reports(created_at DESC);

-- Add trigger to update updated_at for price_alerts
CREATE OR REPLACE FUNCTION update_price_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_price_alerts_updated_at
    BEFORE UPDATE ON price_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_price_alerts_updated_at();

