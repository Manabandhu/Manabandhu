package com.manabandhu.core.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Automatically fixes schema inconsistencies on startup.
 * This ensures that required columns exist even if migrations weren't applied correctly.
 * Runs early in the startup process (Order -100) to fix issues before Hibernate initializes.
 */
@Component
@Slf4j
@Order(-100) // Run very early, before most other components
@ConditionalOnProperty(name = "app.schema-fix.enabled", havingValue = "true", matchIfMissing = true)
public class DatabaseSchemaFixRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Checking for schema inconsistencies and applying fixes...");
        
        try {
            fixRssFeedUrlColumn();
        } catch (Exception e) {
            log.error("Failed to apply schema fixes", e);
            // Don't throw - allow application to continue, but log the error
        }
    }

    private void fixRssFeedUrlColumn() {
        try {
            // Check if column exists
            String checkColumnSql = """
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE lower(table_name) = lower('immigration_news_sources') 
                AND lower(column_name) = lower('rss_feed_url')
                """;
            
            Integer count = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);
            
            if (count == null || count == 0) {
                log.warn("Missing column 'rss_feed_url' in 'immigration_news_sources' table. Adding it now...");
                
                String addColumnSql = """
                    ALTER TABLE immigration_news_sources 
                    ADD COLUMN rss_feed_url VARCHAR(500)
                    """;
                
                jdbcTemplate.execute(addColumnSql);
                log.info("Successfully added 'rss_feed_url' column to 'immigration_news_sources' table");
            } else {
                log.debug("Column 'rss_feed_url' already exists in 'immigration_news_sources' table");
            }
        } catch (Exception e) {
            log.error("Error checking/adding 'rss_feed_url' column", e);
            throw e;
        }
    }
}
