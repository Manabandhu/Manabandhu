# Database Migration Guide

## Current Status

✅ **Flyway is ENABLED** - Migrations will run automatically on application startup
⚠️ **Web Server is TEMPORARILY DISABLED** - Application will run migrations and exit

## Migration File

The ride posts seed migration is located at:
- `src/main/resources/db/migration/V7__Seed_Ride_Posts.sql`

This migration creates:
- 1 REQUEST ride for `test@manabandhu.com`
- 2 OFFER rides for `otheruser@manabandhu.com`
- 3 REQUEST rides for `otheruser@manabandhu.com`

## Running Migrations

### Option 1: Automatic (Current Setup)
When you start the application, Flyway will automatically run all pending migrations:
```bash
mvn spring-boot:run
# or
java -jar target/manabandhu-backend-1.0.0.jar
```
**Note:** With `spring.main.web-application-type=none`, the app will run migrations and exit without starting the web server.

### Option 2: Migration-Only Profile
Use the migration-only profile to run migrations without starting services:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=migration-only
# or
java -jar app.jar --spring.profiles.active=migration-only
```

### Option 3: Flyway Maven Plugin (Standalone)
Run migrations directly without starting Spring Boot:
```bash
# Set database connection properties
export DATABASE_URL="jdbc:postgresql://localhost:5432/your_database"
export DATABASE_USER="your_user"
export DATABASE_PASSWORD="your_password"

# Run migrations
mvn flyway:migrate -Ddatabase.url=${DATABASE_URL} -Ddatabase.user=${DATABASE_USER} -Ddatabase.password=${DATABASE_PASSWORD}
```

### Option 4: Direct SQL Execution
Run the standalone SQL file directly:
```bash
psql -d your_database -f seed-ride-posts.sql
```

## Re-enabling Web Server

To re-enable the Spring Boot web server, edit `src/main/resources/application.properties`:

**Change this line:**
```properties
spring.main.web-application-type=none
```

**To:**
```properties
spring.main.web-application-type=servlet
```

**Or simply remove/comment out the line** (servlet is the default).

## Disabling Flyway (if needed)

If you want to disable Flyway temporarily, edit `src/main/resources/application.properties`:

```properties
spring.flyway.enabled=false
```

## Verification

After running migrations, verify the data:
```sql
-- Check ride posts
SELECT id, post_type, owner_user_id, title, status 
FROM ride_posts 
ORDER BY created_at DESC;

-- Should show 6 ride posts
```

## Troubleshooting

1. **Migration fails**: Check that the database connection is correct in `application.properties`
2. **Migrations not running**: Verify `spring.flyway.enabled=true`
3. **Web server not starting**: Check `spring.main.web-application-type` setting

