package com.manabandhu.modules.immigration.components.dto;

import com.manabandhu.modules.immigration.components.model.ImmigrationNewsArticle;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class NewsArticleResponse {
    private UUID id;
    private String title;
    private String summary;
    private String content;
    private String sourceName;
    private String sourceUrl;
    private ImmigrationNewsArticle.SourceType sourceType;
    private LocalDateTime publishedAt;
    private List<String> visaCategories;
    private List<String> countriesAffected;
    private List<String> tags;
    private ImmigrationNewsArticle.ImpactLevel impactLevel;
    private Boolean isBreaking;
    private Boolean isVerified;
    private String verificationNotes;
    private LocalDateTime createdAt;
    private Boolean isBookmarked;
    
    public static NewsArticleResponse from(ImmigrationNewsArticle article, boolean isBookmarked) {
        NewsArticleResponse response = new NewsArticleResponse();
        response.setId(article.getId());
        response.setTitle(article.getTitle());
        response.setSummary(article.getSummary());
        response.setContent(article.getContent());
        response.setSourceName(article.getSourceName());
        response.setSourceUrl(article.getSourceUrl());
        response.setSourceType(article.getSourceType());
        response.setPublishedAt(article.getPublishedAt());
        response.setImpactLevel(article.getImpactLevel());
        response.setIsBreaking(article.getIsBreaking());
        response.setIsVerified(article.getIsVerified());
        response.setVerificationNotes(article.getVerificationNotes());
        response.setCreatedAt(article.getCreatedAt());
        response.setIsBookmarked(isBookmarked);
        
        // Parse JSON arrays
        response.setVisaCategories(parseJsonArray(article.getVisaCategories()));
        response.setCountriesAffected(parseJsonArray(article.getCountriesAffected()));
        response.setTags(parseJsonArray(article.getTags()));
        
        return response;
    }
    
    private static List<String> parseJsonArray(String json) {
        if (json == null || json.trim().isEmpty()) {
            return List.of();
        }
        try {
            return List.of(json.replace("[", "").replace("]", "").replace("\"", "").split(","));
        } catch (Exception e) {
            return List.of();
        }
    }
}