package com.manabandhu.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtTokenService {
    private final SecretKey secretKey;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public JwtTokenService(
            @Value("${security.jwt.secret:change-me-change-me-change-me-change-me}") String secret,
            @Value("${security.jwt.access-ttl-seconds:3600}") long accessTtlSeconds,
            @Value("${security.jwt.refresh-ttl-seconds:2592000}") long refreshTtlSeconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    public String issueAccessToken(String subject) { return issueToken(subject, accessTtlSeconds, "access"); }
    public String issueRefreshToken(String subject) { return issueToken(subject, refreshTtlSeconds, "refresh"); }

    private String issueToken(String subject, long ttlSeconds, String type) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subject)
                .claim("type", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(secretKey)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }

    public String subject(String token) { return parse(token).getSubject(); }
    public boolean isRefreshToken(String token) { return "refresh".equals(parse(token).get("type", String.class)); }
}
