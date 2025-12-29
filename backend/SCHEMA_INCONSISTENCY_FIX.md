# Schema History Inconsistency Fix

## Issue

The Flyway schema history shows that V13 migration was applied, but V12 migration's changes are missing from the database (specifically, the `rss_feed_url` column in `immigration_news_sources` table).

This indicates a schema history inconsistency where:
- V13 is marked as applied in `flyway_schema_history` table
- But V12's actual database changes were not applied

## Root Cause

This can happen when:
1. Migrations were applied manually or in a way that bypassed Flyway's normal checks
2. Database was restored from a backup that didn't include V12 changes
3. Schema history table was modified manually

## Solution

### Option 1: Manually Apply V12 (Recommended)

Since V12 uses `IF NOT EXISTS`, it's safe to run it directly:

```sql
-- Connect to your database and run:
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
```

Then verify the column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'immigration_news_sources' 
AND column_name = 'rss_feed_url';
```

### Option 2: Fix Schema History

If V12 was actually applied but not recorded in schema history:

```sql
-- Check if V12 is in schema history
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
WHERE version = '12';

-- If missing, insert it (adjust installed_on to match when it should have been applied)
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script, 
    installed_on, installed_by, execution_time, success
) VALUES (
    (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history),
    '12', 
    'Add RSS Feed URL To Immigration News Sources', 
    'SQL', 
    'V12__Add_RSS_Feed_URL_To_Immigration_News_Sources.sql',
    NOW(),
    CURRENT_USER,
    0,
    true
);
```

### Option 3: Reset and Re-apply (Use with Caution)

⚠️ **WARNING: Only use this if you're sure about the consequences**

If you need to reset the schema history for V12 and V13:

```sql
-- Delete V12 and V13 from schema history
DELETE FROM flyway_schema_history WHERE version IN ('12', '13');

-- Then restart the application - Flyway will re-apply both migrations
```

## Verification

After applying the fix, verify:

1. **V12 column exists:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'immigration_news_sources' 
AND column_name = 'rss_feed_url';
```

2. **V13 tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'saved_listings',
    'listing_views', 
    'price_alerts',
    'price_alert_amenities',
    'listing_reports'
)
ORDER BY table_name;
```

3. **Schema history is consistent:**
```sql
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
WHERE version IN ('12', '13')
ORDER BY version;
```

## Prevention

The new `FlywayMigrationRunner` component will:
- Explicitly check for pending migrations on startup
- Attempt to apply them if found
- Log warnings if schema inconsistencies are detected

This should help prevent similar issues in the future.

