# Ride Requests Migration Setup

## Current Situation

**Flyway is DISABLED** in `application.properties`:
```properties
spring.flyway.enabled=false
```

**Hibernate DDL Auto is ENABLED**:
```properties
spring.jpa.hibernate.ddl-auto=update
```

## What Will Happen on App Restart

### Option 1: With Current Setup (Hibernate DDL Auto)
✅ **The table WILL be created automatically** when you restart the app because:
- The `RideRequest` entity exists
- Hibernate will detect it and create the table
- The unique constraint will be created (from `@UniqueConstraint` annotation)

⚠️ **However:**
- The **foreign key constraint** might NOT be created (Hibernate doesn't always create FKs with just `@Column`)
- Some **indexes** might be missing
- The table structure might differ slightly from the migration file

### Option 2: Enable Flyway (Recommended)
To ensure the exact migration runs with all constraints and indexes:

1. **Enable Flyway** in `application.properties`:
```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

2. **Disable Hibernate DDL Auto** (to avoid conflicts):
```properties
spring.jpa.hibernate.ddl-auto=none
```

3. **Restart the app** - Flyway will run the migration automatically

## Recommended Action

**For Production:** Enable Flyway (Option 2) to ensure exact schema control.

**For Development:** Current setup will work, but you may want to manually verify the foreign key constraint exists:
```sql
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'ride_requests';
```

## Manual Migration (If Needed)

If you need to run the migration manually:

```bash
# Using psql
psql -d your_database -f src/main/resources/db/migration/V8__Create_Ride_Requests_Table.sql

# Or using the migration-only profile
mvn spring-boot:run -Dspring-boot.run.profiles=migration-only
```

