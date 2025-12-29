package com.manabandhu.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.api.callback.Callback;
import org.flywaydb.core.api.callback.Context;
import org.flywaydb.core.api.callback.Event;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

/**
 * Flyway callback that fixes schema issues before migrations run.
 * This ensures required columns exist even if previous migrations failed.
 */
@Component
@Slf4j
public class FlywayBeforeMigrateCallback implements Callback {

    @Override
    public boolean supports(Event event, Context context) {
        return event == Event.BEFORE_MIGRATE;
    }

    @Override
    public boolean canHandleInTransaction(Event event, Context context) {
        return true;
    }

    @Override
    public void handle(Event event, Context context) {
        if (event == Event.BEFORE_MIGRATE) {
            log.info("Running pre-migration schema fixes...");
            fixRssFeedUrlColumn(context.getConnection());
        }
    }

    @Override
    public String getCallbackName() {
        return "SchemaFixCallback";
    }

    private void fixRssFeedUrlColumn(Connection connection) {
        try (Statement stmt = connection.createStatement()) {
            // Check if column exists
            String checkSql = """
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_name = 'immigration_news_sources' 
                AND column_name = 'rss_feed_url'
                """;
            
            try (var rs = stmt.executeQuery(checkSql)) {
                if (rs.next() && rs.getInt(1) == 0) {
                    log.warn("Missing column 'rss_feed_url' in 'immigration_news_sources' table. Adding it now...");
                    
                    String addColumnSql = """
                        ALTER TABLE immigration_news_sources 
                        ADD COLUMN rss_feed_url VARCHAR(500)
                        """;
                    
                    stmt.execute(addColumnSql);
                    log.info("Successfully added 'rss_feed_url' column to 'immigration_news_sources' table");
                } else {
                    log.debug("Column 'rss_feed_url' already exists in 'immigration_news_sources' table");
                }
            }
        } catch (Exception e) {
            log.error("Error checking/adding 'rss_feed_url' column during pre-migration fix", e);
            // Don't throw - allow migrations to continue
        }
    }
}

