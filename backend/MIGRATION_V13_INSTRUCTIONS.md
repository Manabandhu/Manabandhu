# V13 Migration - Rooms Module Features

## Status
✅ Migration file created: `V13__Add_Rooms_Module_Features.sql`  
⚠️ Migration has NOT been executed yet  
✅ Code updated to handle missing tables gracefully

## What This Migration Creates

1. **saved_listings** - For saved/favorites feature
2. **listing_views** - For view tracking
3. **price_alerts** - For price alert feature
4. **price_alert_amenities** - Junction table
5. **listing_reports** - For reporting feature

## How to Run the Migration

### Option 1: Restart Application (Recommended)
Flyway is enabled and will automatically run pending migrations on startup:

```bash
# Stop the current application (Ctrl+C)
# Then restart:
cd backend
mvn spring-boot:run
```

Look for this in the logs:
```
Successfully applied 1 migration to schema "public" (execution time Xms)
```

### Option 2: Check Flyway Status
To see which migrations have been applied:

```sql
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank DESC 
LIMIT 10;
```

### Option 3: Manual SQL Execution (If Needed)
If Flyway doesn't run automatically, you can execute the SQL manually:

```bash
# Using psql
psql $DATABASE_URL -f src/main/resources/db/migration/V13__Add_Rooms_Module_Features.sql
```

## Current Behavior

The application has been updated to handle missing tables gracefully:
- View tracking will fail silently if table doesn't exist
- Saved listings check will return `false` if table doesn't exist
- No errors will crash the application

However, **features won't work until the migration runs**.

## Verification

After migration runs, verify tables exist:

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

Should return 5 rows.

## Troubleshooting

If migration doesn't run:
1. Check `spring.flyway.enabled=true` in `application.properties`
2. Check Flyway logs for errors
3. Verify migration file is in correct location: `src/main/resources/db/migration/`
4. Check that previous migrations (V12) have been applied

