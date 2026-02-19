package com.manabandhu.modules.immigration.components.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "immigration_news_sources")
@Data
@EqualsAndHashCode(of = "id")
public class ImmigrationNewsSource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(name = "base_url", nullable = false)
    private String baseUrl;
    
    @Column(name = "rss_feed_url")
    private String rssFeedUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImmigrationNewsArticle.SourceType type;
    
    @Column(name = "trust_score", nullable = false)
    private Integer trustScore = 3; // 1-5 scale
    
    @Column(nullable = false)
    private Boolean enabled = true;
}