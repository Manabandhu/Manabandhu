-- Seed 10 Room Listings with Different Locations and Filters
-- This script creates 10 diverse listings with different locations, room types, prices, and filters
-- The listings are created with a seed user ID. You can update the owner_user_id later if needed.

DO $$
DECLARE
    -- Use a consistent seed user ID (you can replace this with an actual user ID from your users table)
    seed_user_id VARCHAR(255) := 'seed-user-' || gen_random_uuid()::text;
    listing_id UUID;
    listing_ids UUID[] := ARRAY[]::UUID[];
    i INTEGER;
BEGIN
    -- Insert 10 listings with different locations and filters
    
    -- Listing 1: Private room for student in Sunnyvale
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Cozy Private Room Near Apple Campus', 'STUDENT', 'PRIVATE', 1,
        1200.00, 1200.00, true, 'BOTH', 'Beautiful private room in a quiet neighborhood, perfect for students. Close to public transport and tech companies.',
        true, 37.3688, -122.0363, 37.3688, -122.0363, 'Sunnyvale, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Laundry');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Internet');
    INSERT INTO room_listing_nearby_localities (listing_id, locality) VALUES (listing_id, 'Cupertino'), (listing_id, 'Mountain View');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Apple Inc'), (listing_id, 'Google');
    
    -- Listing 2: Shared room for professional in San Francisco
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Modern Shared Room in Mission District', 'PROFESSIONAL', 'SHARED', 2,
        900.00, 900.00, true, 'IN_PERSON', 'Spacious shared room in vibrant Mission District. Great for professionals working in SF.',
        true, 37.7599, -122.4148, 37.7599, -122.4148, 'Mission District, San Francisco, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Furnished'), (listing_id, 'Gym Access');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Gas');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Salesforce'), (listing_id, 'Uber');
    
    -- Listing 3: Entire unit for couple in Palo Alto
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Luxury 1BR Apartment Near Stanford', 'COUPLE', 'ENTIRE_UNIT', 2,
        3500.00, 3500.00, false, 'BOTH', 'Beautiful 1-bedroom apartment with modern amenities. Perfect for couples. Close to Stanford University.',
        true, 37.4419, -122.1430, 37.4419, -122.1430, 'Palo Alto, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Dishwasher'), (listing_id, 'AC');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water');
    INSERT INTO room_listing_nearby_schools (listing_id, school) VALUES (listing_id, 'Stanford University');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Facebook'), (listing_id, 'Tesla');
    
    -- Listing 4: Private room for student in Berkeley
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Affordable Room Near UC Berkeley', 'STUDENT', 'PRIVATE', 1,
        850.00, 850.00, true, 'VIDEO_CALL', 'Budget-friendly room perfect for UC Berkeley students. Walking distance to campus.',
        false, NULL, NULL, 37.8715, -122.2730, 'Berkeley, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Furnished');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Internet');
    INSERT INTO room_listing_nearby_schools (listing_id, school) VALUES (listing_id, 'UC Berkeley');
    
    -- Listing 5: Entire unit for family in Fremont
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Family-Friendly 2BR House with Yard', 'FAMILY', 'ENTIRE_UNIT', 4,
        2800.00, 2800.00, false, 'IN_PERSON', 'Spacious 2-bedroom house with backyard. Great for families with kids. Safe neighborhood.',
        true, 37.5483, -121.9886, 37.5483, -121.9886, 'Fremont, CA', 'IN_TALKS',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Yard'), (listing_id, 'Dishwasher');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Gas');
    INSERT INTO room_listing_nearby_schools (listing_id, school) VALUES (listing_id, 'Fremont High School');
    
    -- Listing 6: Shared room for professional in Mountain View
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Tech Hub Shared Room - Mountain View', 'PROFESSIONAL', 'SHARED', 2,
        1100.00, 1100.00, true, 'BOTH', 'Modern shared accommodation in the heart of Silicon Valley. Perfect for tech professionals.',
        true, 37.4056, -122.0775, 37.4056, -122.0775, 'Mountain View, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Gym Access'), (listing_id, 'Pool');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Internet');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Google'), (listing_id, 'LinkedIn'), (listing_id, 'Microsoft');
    
    -- Listing 7: Private room for couple in San Jose
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Quiet Private Room for Couple', 'COUPLE', 'PRIVATE', 2,
        1400.00, 1400.00, true, 'IN_PERSON', 'Comfortable private room suitable for couples. Quiet neighborhood with easy access to downtown.',
        false, NULL, NULL, 37.3382, -121.8863, 'San Jose, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Furnished');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Internet');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Cisco'), (listing_id, 'Adobe');
    
    -- Listing 8: Entire unit for family in Santa Clara
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Spacious 3BR Home - Great Schools', 'FAMILY', 'ENTIRE_UNIT', 5,
        4200.00, 4200.00, false, 'BOTH', 'Large family home in excellent school district. 3 bedrooms, 2 bathrooms, perfect for growing families.',
        true, 37.3541, -121.9552, 37.3541, -121.9552, 'Santa Clara, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Yard'), (listing_id, 'Garage'), (listing_id, 'Dishwasher');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Gas');
    INSERT INTO room_listing_nearby_schools (listing_id, school) VALUES (listing_id, 'Santa Clara High School'), (listing_id, 'Mission College');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Intel'), (listing_id, 'NVIDIA');
    
    -- Listing 9: Private room for student in Oakland
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Budget Room Near BART Station', 'STUDENT', 'PRIVATE', 1,
        750.00, 750.00, true, 'VIDEO_CALL', 'Affordable room near BART station. Easy commute to SF and Berkeley. Perfect for students.',
        false, NULL, NULL, 37.8044, -122.2712, 'Oakland, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Furnished');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Internet');
    INSERT INTO room_listing_nearby_localities (listing_id, locality) VALUES (listing_id, 'Downtown Oakland');
    
    -- Listing 10: Shared room for professional in Redwood City
    listing_id := gen_random_uuid();
    listing_ids := array_append(listing_ids, listing_id);
    INSERT INTO room_listings (
        id, owner_user_id, title, listing_for, room_type, people_allowed,
        rent_monthly, deposit, utilities_included, visit_type, description,
        location_exact_enabled, lat_exact, lng_exact, lat_approx, lng_approx,
        approx_area_label, status, created_at, updated_at, last_activity_at, version
    ) VALUES (
        listing_id, seed_user_id, 'Modern Shared Space - Redwood City', 'PROFESSIONAL', 'SHARED', 2,
        1000.00, 1000.00, true, 'BOTH', 'Contemporary shared room in new building. Close to Caltrain and major tech companies.',
        true, 37.4852, -122.2364, 37.4852, -122.2364, 'Redwood City, CA', 'AVAILABLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
    );
    INSERT INTO room_listing_amenities (listing_id, amenity) VALUES (listing_id, 'WiFi'), (listing_id, 'Parking'), (listing_id, 'Gym Access'), (listing_id, 'Pool'), (listing_id, 'Furnished');
    INSERT INTO room_listing_utilities (listing_id, utility) VALUES (listing_id, 'Electricity'), (listing_id, 'Water'), (listing_id, 'Internet');
    INSERT INTO room_listing_nearby_companies (listing_id, company) VALUES (listing_id, 'Oracle'), (listing_id, 'Electronic Arts');
    
    -- Create activity records for each listing
    FOR i IN 1..array_length(listing_ids, 1) LOOP
        INSERT INTO room_listing_activities (
            id, listing_id, actor_user_id, type, metadata, created_at
        ) VALUES (
            gen_random_uuid(), listing_ids[i], seed_user_id, 'CREATED',
            jsonb_build_object('title', 'Listing created'), CURRENT_TIMESTAMP
        );
    END LOOP;
    
    RAISE NOTICE 'Successfully created 10 room listings with seed user ID: %', seed_user_id;
END $$;

