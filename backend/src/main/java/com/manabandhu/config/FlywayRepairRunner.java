package com.manabandhu.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
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
        } catch (Exception e) {
            log.error("Failed to run Flyway repair", e);
            throw new RuntimeException("Flyway repair failed", e);
        }
    }
}

