-- Seed Ride Posts for Testing
-- This script creates test ride posts:
-- - 1 REQUEST ride for test@manabandhu.com
-- - 2 OFFER rides for otheruser@manabandhu.com
-- - 3 REQUEST rides for otheruser@manabandhu.com

DO $$
DECLARE
    test_user_id VARCHAR(255) := 'test@manabandhu.com';
    other_user_id VARCHAR(255) := 'otheruser@manabandhu.com';
    ride_id UUID;
    depart_time TIMESTAMP;
    expire_time TIMESTAMP;
BEGIN
    -- Set base departure time (2 days from now)
    depart_time := CURRENT_TIMESTAMP + INTERVAL '2 days';
    expire_time := depart_time + INTERVAL '7 days';

    -- 1. REQUEST ride for test@manabandhu.com
    ride_id := gen_random_uuid();
    INSERT INTO ride_posts (
        id, post_type, owner_user_id, title,
        pickup_lat, pickup_lng, pickup_label,
        drop_lat, drop_lng, drop_label,
        route_distance_miles, depart_at, seats_needed,
        pricing_mode, price_total, status,
        created_at, updated_at, last_activity_at, expires_at, version
    ) VALUES (
        ride_id, 'REQUEST', test_user_id, 'Need a ride to San Francisco Airport',
        37.3688, -122.0363, 'Sunnyvale, CA',
        37.6213, -122.3790, 'San Francisco International Airport (SFO)',
        25.5, depart_time, 1,
        'FIXED', 30.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, expire_time, 0
    );
    
    INSERT INTO ride_post_activities (
        id, ride_post_id, actor_user_id, type, metadata, created_at
    ) VALUES (
        gen_random_uuid(), ride_id, test_user_id, 'CREATED',
        '{"title": "Ride request created"}', CURRENT_TIMESTAMP
    );

    -- 2. OFFER ride #1 for otheruser@manabandhu.com
    ride_id := gen_random_uuid();
    depart_time := CURRENT_TIMESTAMP + INTERVAL '3 days';
    expire_time := depart_time + INTERVAL '7 days';
    INSERT INTO ride_posts (
        id, post_type, owner_user_id, title,
        pickup_lat, pickup_lng, pickup_label,
        drop_lat, drop_lng, drop_label,
        route_distance_miles, depart_at, seats_total,
        pricing_mode, price_total, status,
        created_at, updated_at, last_activity_at, expires_at, version
    ) VALUES (
        ride_id, 'OFFER', other_user_id, 'Daily commute to Mountain View',
        37.7749, -122.4194, 'San Francisco, CA',
        37.4056, -122.0775, 'Mountain View, CA',
        35.2, depart_time, 3,
        'FIXED', 15.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, expire_time, 0
    );
    
    INSERT INTO ride_post_activities (
        id, ride_post_id, actor_user_id, type, metadata, created_at
    ) VALUES (
        gen_random_uuid(), ride_id, other_user_id, 'CREATED',
        '{"title": "Ride offer created"}', CURRENT_TIMESTAMP
    );

    -- 3. OFFER ride #2 for otheruser@manabandhu.com
    ride_id := gen_random_uuid();
    depart_time := CURRENT_TIMESTAMP + INTERVAL '5 days';
    expire_time := depart_time + INTERVAL '7 days';
    INSERT INTO ride_posts (
        id, post_type, owner_user_id, title,
        pickup_lat, pickup_lng, pickup_label,
        drop_lat, drop_lng, drop_label,
        route_distance_miles, depart_at, seats_total,
        pricing_mode, price_per_mile, price_total, status,
        created_at, updated_at, last_activity_at, expires_at, version
    ) VALUES (
        ride_id, 'OFFER', other_user_id, 'Weekend trip to Santa Cruz',
        37.3688, -122.0363, 'Sunnyvale, CA',
        36.9741, -122.0308, 'Santa Cruz, CA',
        28.7, depart_time, 2,
        'PER_MILE', 0.50, 14.35, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, expire_time, 0
    );
    
    INSERT INTO ride_post_activities (
        id, ride_post_id, actor_user_id, type, metadata, created_at
    ) VALUES (
        gen_random_uuid(), ride_id, other_user_id, 'CREATED',
        '{"title": "Ride offer created"}', CURRENT_TIMESTAMP
    );

    -- 4. REQUEST ride #1 for otheruser@manabandhu.com
    ride_id := gen_random_uuid();
    depart_time := CURRENT_TIMESTAMP + INTERVAL '1 day';
    expire_time := depart_time + INTERVAL '7 days';
    INSERT INTO ride_posts (
        id, post_type, owner_user_id, title,
        pickup_lat, pickup_lng, pickup_label,
        drop_lat, drop_lng, drop_label,
        route_distance_miles, depart_at, seats_needed,
        pricing_mode, price_total, status,
        created_at, updated_at, last_activity_at, expires_at, version
    ) VALUES (
        ride_id, 'REQUEST', other_user_id, 'Looking for ride to San Jose',
        37.7749, -122.4194, 'San Francisco, CA',
        37.3382, -121.8863, 'San Jose, CA',
        45.8, depart_time, 2,
        'FIXED', 25.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, expire_time, 0
    );
    
    INSERT INTO ride_post_activities (
        id, ride_post_id, actor_user_id, type, metadata, created_at
    ) VALUES (
        gen_random_uuid(), ride_id, other_user_id, 'CREATED',
        '{"title": "Ride request created"}', CURRENT_TIMESTAMP
    );

    -- 5. REQUEST ride #2 for otheruser@manabandhu.com
    ride_id := gen_random_uuid();
    depart_time := CURRENT_TIMESTAMP + INTERVAL '4 days';
    expire_time := depart_time + INTERVAL '7 days';
    INSERT INTO ride_posts (
        id, post_type, owner_user_id, title,
        pickup_lat, pickup_lng, pickup_label,
        drop_lat, drop_lng, drop_label,
        route_distance_miles, depart_at, seats_needed,
        pricing_mode, price_total, status,
        created_at, updated_at, last_activity_at, expires_at, version
    ) VALUES (
        ride_id, 'REQUEST', other_user_id, 'Need ride to Palo Alto',
        37.3688, -122.0363, 'Sunnyvale, CA',
        37.4419, -122.1430, 'Palo Alto, CA',
        8.3, depart_time, 1,
        'FIXED', 12.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, expire_time, 0
    );
    
    INSERT INTO ride_post_activities (
        id, ride_post_id, actor_user_id, type, metadata, created_at
    ) VALUES (
        gen_random_uuid(), ride_id, other_user_id, 'CREATED',
        '{"title": "Ride request created"}', CURRENT_TIMESTAMP
    );

    -- 6. REQUEST ride #3 for otheruser@manabandhu.com
    ride_id := gen_random_uuid();
    depart_time := CURRENT_TIMESTAMP + INTERVAL '6 days';
    expire_time := depart_time + INTERVAL '7 days';
    INSERT INTO ride_posts (
        id, post_type, owner_user_id, title,
        pickup_lat, pickup_lng, pickup_label,
        drop_lat, drop_lng, drop_label,
        route_distance_miles, depart_at, seats_needed,
        pricing_mode, price_total, status,
        created_at, updated_at, last_activity_at, expires_at, version
    ) VALUES (
        ride_id, 'REQUEST', other_user_id, 'Airport ride needed',
        37.4056, -122.0775, 'Mountain View, CA',
        37.6213, -122.3790, 'San Francisco International Airport (SFO)',
        22.1, depart_time, 1,
        'FIXED', 35.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, expire_time, 0
    );
    
    INSERT INTO ride_post_activities (
        id, ride_post_id, actor_user_id, type, metadata, created_at
    ) VALUES (
        gen_random_uuid(), ride_id, other_user_id, 'CREATED',
        '{"title": "Ride request created"}', CURRENT_TIMESTAMP
    );

    RAISE NOTICE 'Successfully created 6 ride posts:';
    RAISE NOTICE '  - 1 REQUEST for test@manabandhu.com';
    RAISE NOTICE '  - 2 OFFER for otheruser@manabandhu.com';
    RAISE NOTICE '  - 3 REQUEST for otheruser@manabandhu.com';
END $$;

