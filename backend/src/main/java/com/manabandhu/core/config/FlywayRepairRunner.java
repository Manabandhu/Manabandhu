package com.manabandhu.core.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@ConditionalOnBean(Flyway.class)
@ConditionalOnProperty(name = "spring.flyway.repair-on-startup", havingValue = "true", matchIfMissing = false)
public class FlywayRepairRunner implements CommandLineRunner {

    @Autowired
    private Flyway flyway;

    @Override
    public void run(String... args) {
        log.info("Running Flyway repair to fix checksums...");
        try {
            flyway.repair();
            log.info("Flyway repair completed successfully. Checksums have been updated.");
            
            // Check for pending migrations and log status
            MigrationInfo[] pending = flyway.info().pending();
            MigrationInfo[] applied = flyway.info().applied();
            
            log.info("Flyway migration status:");
            log.info("  Applied migrations: {}", applied.length);
            log.info("  Pending migrations: {}", pending.length);
            
            if (pending.length > 0) {
                log.warn("Pending migration(s) detected:");
                for (MigrationInfo info : pending) {
                    log.warn("  - {}: {}", info.getVersion(), info.getDescription());
                }
                log.warn("These migrations should be applied automatically by Spring Boot's Flyway auto-configuration.");
                log.warn("If they are not applied, check for schema history inconsistencies.");
            } else {
                log.info("No pending migrations found. All migrations are up to date.");
            }
            
            // Log recent applied migrations
            if (applied.length > 0) {
                log.info("Most recent applied migrations:");
                int start = Math.max(0, applied.length - 3);
                for (int i = start; i < applied.length; i++) {
                    MigrationInfo info = applied[i];
                    log.info("  - {}: {} (applied: {})", 
                        info.getVersion(), 
                        info.getDescription(),
                        info.getInstalledOn());
                }
            }
        } catch (Exception e) {
            log.error("Failed to run Flyway repair", e);
            throw new RuntimeException("Flyway repair failed", e);
        }
    }
}
