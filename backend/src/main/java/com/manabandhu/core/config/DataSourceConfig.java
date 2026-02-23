package com.manabandhu.core.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String jdbcUrl = StringUtils.hasText(properties.getUrl()) ? properties.getUrl() : databaseUrl;
        if (!StringUtils.hasText(jdbcUrl)) {
            throw new IllegalStateException("spring.datasource.url must be configured");
        }
        String modifiedUrl = maybeDisablePreparedStatementCaching(jdbcUrl);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(modifiedUrl);
        if (StringUtils.hasText(properties.getDriverClassName())) {
            config.setDriverClassName(properties.getDriverClassName());
        }
        if (StringUtils.hasText(properties.getUsername())) {
            config.setUsername(properties.getUsername());
        }
        if (StringUtils.hasText(properties.getPassword())) {
            config.setPassword(properties.getPassword());
        }
        config.setConnectionTestQuery("SELECT 1");
        config.setMaxLifetime(600000);
        
        return new HikariDataSource(config);
    }

    private String maybeDisablePreparedStatementCaching(String jdbcUrl) {
        // PostgreSQL-only setting; H2 and other drivers do not accept prepareThreshold.
        if (!jdbcUrl.startsWith("jdbc:postgresql:") || jdbcUrl.contains("prepareThreshold")) {
            return jdbcUrl;
        }
        String separator = jdbcUrl.contains("?") ? "&" : "?";
        return jdbcUrl + separator + "prepareThreshold=0";
    }
}
