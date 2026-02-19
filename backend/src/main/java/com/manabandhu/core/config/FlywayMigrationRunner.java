package com.manabandhu.core.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Ensures Flyway migrations are applied on application startup.
 * This runs after FlywayRepairRunner (if enabled) to apply any pending migrations.
 */
@Component
@Slf4j
@Order(1) // Run after FlywayRepairRunner (which has default order 0)
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = false)
public class FlywayMigrationRunner implements CommandLineRunner {

    @Autowired
    private Flyway flyway;

    @Override
    public void run(String... args) {
        log.info("Checking Flyway migration status...");
        try {
            MigrationInfo[] pending = flyway.info().pending();
            MigrationInfo[] applied = flyway.info().applied();
            
            log.info("Flyway migration status:");
            log.info("  Applied migrations: {}", applied.length);
            log.info("  Pending migrations: {}", pending.length);
            
            if (pending.length > 0) {
                log.warn("Found {} pending migration(s). Flyway should apply them automatically, but ensuring they are applied...", pending.length);
                for (MigrationInfo info : pending) {
                    log.info("  - {}: {}", info.getVersion(), info.getDescription());
                }
                
                // Explicitly call migrate to ensure migrations are applied
                var migrateResult = flyway.migrate();
                int migrationsApplied = migrateResult.migrationsExecuted;
                if (migrationsApplied > 0) {
                    log.info("Successfully applied {} migration(s).", migrationsApplied);
                } else {
                    log.warn("No migrations were applied. This may indicate a schema history inconsistency.");
                }
            } else {
                log.info("No pending migrations found. All migrations are up to date.");
            }
            
            // Log recent applied migrations for verification
            if (applied.length > 0) {
                log.info("Most recent applied migrations:");
                int start = Math.max(0, applied.length - 5);
                for (int i = start; i < applied.length; i++) {
                    MigrationInfo info = applied[i];
                    log.info("  - {}: {} (applied: {})", 
                        info.getVersion(), 
                        info.getDescription(),
                        info.getInstalledOn());
                }
            }
        } catch (Exception e) {
            log.error("Failed to check/apply Flyway migrations", e);
            // Don't throw - let the application continue, but log the error
            // Spring Boot's Flyway auto-configuration should handle migrations
        }
    }
}

