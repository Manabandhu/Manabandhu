-- Manual fix for V12 migration if schema history is inconsistent
-- This script is idempotent and safe to run multiple times
-- Run this if V12 is marked as applied in schema history but the column doesn't exist
--
-- Usage: psql $DATABASE_URL -f scripts/fix_v12_manual.sql

-- Add rss_feed_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'immigration_news_sources' 
        AND column_name = 'rss_feed_url'
    ) THEN
        ALTER TABLE immigration_news_sources 
        ADD COLUMN rss_feed_url VARCHAR(500);
        
        RAISE NOTICE 'Successfully added rss_feed_url column to immigration_news_sources table';
    ELSE
        RAISE NOTICE 'Column rss_feed_url already exists in immigration_news_sources table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'immigration_news_sources' 
            AND column_name = 'rss_feed_url'
        ) THEN 'SUCCESS: rss_feed_url column exists'
        ELSE 'ERROR: rss_feed_url column still missing'
    END AS verification_result;

