package com.manabandhu.modules.immigration.articles.controller;

import com.manabandhu.modules.immigration.components.dto.NewsArticleResponse;
import com.manabandhu.modules.immigration.components.dto.NewsFilterRequest;
import com.manabandhu.modules.immigration.components.dto.VerifyArticleRequest;
import com.manabandhu.modules.immigration.components.service.ImmigrationNewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/immigration")
@RequiredArgsConstructor
@Tag(name = "Immigration News", description = "Immigration news and updates")
public class ImmigrationNewsController {
    
    private final ImmigrationNewsService newsService;
    
    @GetMapping("/news")
    @Operation(summary = "Get immigration news with filters")
    public ResponseEntity<Page<NewsArticleResponse>> getNews(
            @RequestParam(required = false) String visaCategory,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String impactLevel,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) Boolean isBreaking,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            Authentication authentication) {
        
        NewsFilterRequest filterRequest = new NewsFilterRequest();
        filterRequest.setVisaCategory(visaCategory);
        filterRequest.setCountry(country);
        filterRequest.setImpactLevel(impactLevel);
        filterRequest.setSourceType(sourceType);
        filterRequest.setIsBreaking(isBreaking);
        filterRequest.setPage(page);
        filterRequest.setSize(size);
        
        String userId = authentication.getName();
        Page<NewsArticleResponse> news = newsService.getNews(filterRequest, userId);
        return ResponseEntity.ok(news);
    }
    
    @GetMapping("/news/{id}")
    @Operation(summary = "Get immigration news article by ID")
    public ResponseEntity<NewsArticleResponse> getNewsById(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        NewsArticleResponse article = newsService.getArticleById(id, userId);
        return ResponseEntity.ok(article);
    }
    
    @PostMapping("/news/{id}/bookmark")
    @Operation(summary = "Bookmark an immigration news article")
    public ResponseEntity<Void> bookmarkArticle(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        newsService.bookmarkArticle(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/news/{id}/bookmark")
    @Operation(summary = "Remove bookmark from immigration news article")
    public ResponseEntity<Void> removeBookmark(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        newsService.removeBookmark(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/news/bookmarks")
    @Operation(summary = "Get bookmarked immigration news articles")
    public ResponseEntity<Page<NewsArticleResponse>> getBookmarkedNews(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Page<NewsArticleResponse> bookmarkedNews = newsService.getBookmarkedNews(userId, page, size);
        return ResponseEntity.ok(bookmarkedNews);
    }
    
    @PostMapping("/news/{id}/verify")
    @Operation(summary = "Verify an immigration news article (Admin only)")
    public ResponseEntity<Void> verifyArticle(
            @PathVariable UUID id,
            @RequestBody VerifyArticleRequest request) {
        
        newsService.verifyArticle(id, request);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/news/{id}/archive")
    @Operation(summary = "Archive an immigration news article (Admin only)")
    public ResponseEntity<Void> archiveArticle(@PathVariable UUID id) {
        newsService.archiveArticle(id);
        return ResponseEntity.ok().build();
    }
}