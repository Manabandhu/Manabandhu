-- Fix: Ensure rss_feed_url column exists in immigration_news_sources table
-- This migration is idempotent and safe to run even if the column already exists
-- It fixes schema inconsistencies where V12 was marked as applied but the column doesn't exist

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
        RAISE NOTICE 'Column rss_feed_url already exists in immigration_news_sources table - no action needed';
    END IF;
END $$;

