-- Clear all prepared statements in PostgreSQL
-- This fixes the "cached plan must not change result type" error
-- Run this script after schema migrations that change column types

-- Deallocate all prepared statements
DEALLOCATE ALL;

-- Optional: If you want to be more specific, you can also:
-- DEALLOCATE PREPARE <statement_name>;

-- Note: This needs to be run on each database connection
-- If using a connection pool, you may need to restart the application
-- or run this command for each active connection

