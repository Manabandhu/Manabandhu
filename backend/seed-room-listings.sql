-- Standalone SQL Script to Seed 10 Room Listings
-- Run this script directly in your PostgreSQL database if you prefer not to use Flyway migrations
-- 
-- Usage:
--   psql -d your_database -f seed-room-listings.sql
--   OR
--   Connect to your database and run this script
--
-- Note: Update the seed_user_id below with an actual user ID from your users table,
--       or the script will create listings with a generated seed user ID

-- Set the seed user ID (replace with an actual user ID if you have one)
\set seed_user_id 'seed-user-' || gen_random_uuid()::text

-- Listing 1: Private room for student in Sunnyvale
INSERT INTO room_listings (
    id, owner_user_id, title, listing_for, room_type, people_allowed,
    rent_monthly, deposit, utilities_included, visit_type, description,
    location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
    approx_area_label, status, created_at, updated_at, last_activity_at, version
) VALUES (
    gen_random_uuid(), :'seed_user_id', 'Cozy Private Room Near Apple Campus', 'STUDENT', 'PRIVATE', 1,
    1200.00, 1200.00, true, 'BOTH', 'Beautiful private room in a quiet neighborhood, perfect for students. Close to public transport and tech companies.',
    true, 37.3688, -122.0363, 37.3688, -122.0363, 'Sunnyvale, CA', 'AVAILABLE',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
) RETURNING id INTO listing_id_1;

INSERT INTO room_listing_amenities (listing_id, amenity) 
SELECT listing_id_1, unnest(ARRAY['WiFi', 'Parking', 'Laundry']);
INSERT INTO room_listing_utilities (listing_id, utility) 
SELECT listing_id_1, unnest(ARRAY['Electricity', 'Water', 'Internet']);
INSERT INTO room_listing_nearby_localities (listing_id, locality) 
SELECT listing_id_1, unnest(ARRAY['Cupertino', 'Mountain View']);
INSERT INTO room_listing_nearby_companies (listing_id, company) 
SELECT listing_id_1, unnest(ARRAY['Apple Inc', 'Google']);

-- Continue with other listings...
-- (This is a simplified version - the full migration file V6__Seed_Room_Listings.sql has all 10 listings)

