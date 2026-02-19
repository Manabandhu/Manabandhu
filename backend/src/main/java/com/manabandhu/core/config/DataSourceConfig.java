package com.manabandhu.core.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        // Append prepareThreshold=0 to disable prepared statement caching
        // This fixes the "cached plan must not change result type" error
        // after schema migrations that change column types
        String modifiedUrl = databaseUrl;
        if (!modifiedUrl.contains("prepareThreshold")) {
            String separator = modifiedUrl.contains("?") ? "&" : "?";
            modifiedUrl = modifiedUrl + separator + "prepareThreshold=0";
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(modifiedUrl);
        config.setDriverClassName(properties.getDriverClassName());
        config.setConnectionTestQuery("SELECT 1");
        config.setMaxLifetime(600000);
        
        return new HikariDataSource(config);
    }
}

