package com.manabandhu.modules.immigration.components.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "immigration_news_articles")
@Data
@EqualsAndHashCode(of = "id")
public class ImmigrationNewsArticle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "source_name", nullable = false)
    private String sourceName;
    
    @Column(name = "source_url", nullable = false)
    private String sourceUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private SourceType sourceType;
    
    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt;
    
    @Column(name = "ingested_at", nullable = false)
    private LocalDateTime ingestedAt;
    
    @Column(name = "visa_categories", columnDefinition = "TEXT")
    private String visaCategories; // JSON array
    
    @Column(name = "countries_affected", columnDefinition = "TEXT")
    private String countriesAffected; // JSON array
    
    @Column(columnDefinition = "TEXT")
    private String tags; // JSON array
    
    @Enumerated(EnumType.STRING)
    @Column(name = "impact_level", nullable = false)
    private ImpactLevel impactLevel;
    
    @Column(name = "is_breaking", nullable = false)
    private Boolean isBreaking = false;
    
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;
    
    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language = Language.EN;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum SourceType {
        OFFICIAL, LAW_FIRM, NEWS_MEDIA
    }
    
    public enum ImpactLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum Language {
        EN, OTHER
    }
    
    public enum Status {
        ACTIVE, ARCHIVED
    }
}