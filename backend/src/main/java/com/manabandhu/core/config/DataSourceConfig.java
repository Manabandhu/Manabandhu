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
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String configuredUrl = firstNonBlank(properties.getUrl(), databaseUrl);
        ParsedDatabaseUrl parsedUrl = parseDatabaseUrl(configuredUrl);
        if (!StringUtils.hasText(parsedUrl.jdbcUrl())) {
            throw new IllegalStateException("Database URL must be configured via spring.datasource.url or DATABASE_URL");
        }
        String modifiedUrl = maybeDisablePreparedStatementCaching(parsedUrl.jdbcUrl());

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(modifiedUrl);
        if (StringUtils.hasText(properties.getDriverClassName())) {
            config.setDriverClassName(properties.getDriverClassName());
        }
        String username = firstNonBlank(properties.getUsername(), parsedUrl.username());
        if (StringUtils.hasText(username)) {
            config.setUsername(username);
        }
        String password = firstNonBlank(properties.getPassword(), parsedUrl.password());
        if (StringUtils.hasText(password)) {
            config.setPassword(password);
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

    private ParsedDatabaseUrl parseDatabaseUrl(String configuredUrl) {
        if (!StringUtils.hasText(configuredUrl)) {
            return new ParsedDatabaseUrl(null, null, null);
        }

        String trimmedUrl = configuredUrl.trim();
        if (trimmedUrl.startsWith("jdbc:")) {
            return new ParsedDatabaseUrl(trimmedUrl, null, null);
        }

        if (!trimmedUrl.startsWith("postgres://") && !trimmedUrl.startsWith("postgresql://")) {
            return new ParsedDatabaseUrl(trimmedUrl, null, null);
        }

        URI uri = URI.create(trimmedUrl);
        if (!StringUtils.hasText(uri.getHost())) {
            throw new IllegalArgumentException("Invalid DATABASE_URL host in: " + configuredUrl);
        }

        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://")
            .append(uri.getHost());
        if (uri.getPort() > 0) {
            jdbc.append(":").append(uri.getPort());
        }
        if (uri.getPath() != null) {
            jdbc.append(uri.getPath());
        }
        if (StringUtils.hasText(uri.getRawQuery())) {
            jdbc.append("?").append(uri.getRawQuery());
        }

        Credentials credentials = parseCredentials(uri.getRawUserInfo());
        return new ParsedDatabaseUrl(jdbc.toString(), credentials.username(), credentials.password());
    }

    private Credentials parseCredentials(String userInfo) {
        if (!StringUtils.hasText(userInfo)) {
            return new Credentials(null, null);
        }

        int separatorIndex = userInfo.indexOf(':');
        String username = separatorIndex >= 0 ? userInfo.substring(0, separatorIndex) : userInfo;
        String password = separatorIndex >= 0 ? userInfo.substring(separatorIndex + 1) : null;

        return new Credentials(decode(username), decode(password));
    }

    private String decode(String value) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private String firstNonBlank(String first, String second) {
        if (StringUtils.hasText(first)) {
            return first;
        }
        if (StringUtils.hasText(second)) {
            return second;
        }
        return null;
    }

    private record ParsedDatabaseUrl(String jdbcUrl, String username, String password) {
    }

    private record Credentials(String username, String password) {
    }
}
