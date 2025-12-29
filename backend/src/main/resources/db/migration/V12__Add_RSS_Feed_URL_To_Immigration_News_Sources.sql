-- Add rss_feed_url column to immigration_news_sources table
-- This column is optional and allows news sources to specify an RSS feed URL

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
    END IF;
END $$;

