package com.manabandhu.modules.immigration.components.service;

import com.manabandhu.modules.immigration.components.dto.NewsArticleResponse;
import com.manabandhu.modules.immigration.components.dto.NewsFilterRequest;
import com.manabandhu.modules.immigration.components.dto.VerifyArticleRequest;
import com.manabandhu.modules.immigration.components.model.ImmigrationNewsActivity;
import com.manabandhu.modules.immigration.components.model.ImmigrationNewsArticle;
import com.manabandhu.modules.immigration.components.model.ImmigrationNewsBookmark;
import com.manabandhu.repository.*;
import com.manabandhu.shared.utils.NotificationEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImmigrationNewsService {
    
    private final ImmigrationNewsArticleRepository articleRepository;
    private final ImmigrationNewsBookmarkRepository bookmarkRepository;
    private final ImmigrationNewsActivityRepository activityRepository;
    
    @Cacheable(value = "immigrationNews", key = "#filterRequest.toString() + '_' + #userId")
    public Page<NewsArticleResponse> getNews(NewsFilterRequest filterRequest, String userId) {
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize());
        
        ImmigrationNewsArticle.ImpactLevel impactLevel = null;
        if (filterRequest.getImpactLevel() != null) {
            impactLevel = ImmigrationNewsArticle.ImpactLevel.valueOf(filterRequest.getImpactLevel());
        }
        
        ImmigrationNewsArticle.SourceType sourceType = null;
        if (filterRequest.getSourceType() != null) {
            sourceType = ImmigrationNewsArticle.SourceType.valueOf(filterRequest.getSourceType());
        }
        
        Page<ImmigrationNewsArticle> articles = articleRepository.findWithFilters(
            ImmigrationNewsArticle.Status.ACTIVE,
            filterRequest.getVisaCategory(),
            filterRequest.getCountry(),
            impactLevel,
            sourceType,
            filterRequest.getIsBreaking(),
            pageable
        );
        
        Set<UUID> bookmarkedIds = getBookmarkedArticleIds(userId);
        
        return articles.map(article -> 
            NewsArticleResponse.from(article, bookmarkedIds.contains(article.getId())));
    }
    
    public NewsArticleResponse getArticleById(UUID articleId, String userId) {
        ImmigrationNewsArticle article = articleRepository.findById(articleId)
            .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        
        boolean isBookmarked = bookmarkRepository.existsByArticleIdAndUserId(articleId, userId);
        return NewsArticleResponse.from(article, isBookmarked);
    }
    
    @Transactional
    public void bookmarkArticle(UUID articleId, String userId) {
        if (bookmarkRepository.existsByArticleIdAndUserId(articleId, userId)) {
            return; // Already bookmarked
        }
        
        ImmigrationNewsBookmark bookmark = new ImmigrationNewsBookmark();
        bookmark.setArticleId(articleId);
        bookmark.setUserId(userId);
        bookmarkRepository.save(bookmark);
    }
    
    @Transactional
    public void removeBookmark(UUID articleId, String userId) {
        bookmarkRepository.deleteByArticleIdAndUserId(articleId, userId);
    }
    
    public Page<NewsArticleResponse> getBookmarkedNews(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ImmigrationNewsBookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return bookmarks.map(bookmark -> {
            ImmigrationNewsArticle article = articleRepository.findById(bookmark.getArticleId())
                .orElse(null);
            return article != null ? NewsArticleResponse.from(article, true) : null;
        }).map(response -> response); // Filter nulls would be done here in real implementation
    }
    
    @Transactional
    public void verifyArticle(UUID articleId, VerifyArticleRequest request) {
        ImmigrationNewsArticle article = articleRepository.findById(articleId)
            .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        
        article.setIsVerified(request.getIsVerified());
        article.setVerificationNotes(request.getVerificationNotes());
        articleRepository.save(article);
    }
    
    @Transactional
    public void archiveArticle(UUID articleId) {
        ImmigrationNewsArticle article = articleRepository.findById(articleId)
            .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        
        article.setStatus(ImmigrationNewsArticle.Status.ARCHIVED);
        articleRepository.save(article);
    }
    
    @Transactional
    public void processBreakingNews(ImmigrationNewsArticle article) {
        if (article.getIsBreaking() && article.getImpactLevel() == ImmigrationNewsArticle.ImpactLevel.CRITICAL) {
            // Create activity for home feed
            ImmigrationNewsActivity activity = new ImmigrationNewsActivity();
            activity.setArticleId(article.getId());
            activity.setType(ImmigrationNewsActivity.ActivityType.BREAKING_NEWS);
            activityRepository.save(activity);
            
            // Send notifications (simplified - would need user targeting logic)
            sendBreakingNewsNotification(article);
        }
    }
    
    private void sendBreakingNewsNotification(ImmigrationNewsArticle article) {
        try {
            // This would need to be enhanced to target specific users based on visa categories
            // For now, it's a placeholder for the notification structure
            log.info("Breaking news notification prepared for article: {} - {}", article.getId(), article.getTitle());
        } catch (Exception e) {
            log.error("Failed to send breaking news notification for article: {}", article.getId(), e);
        }
    }
    
    private Set<UUID> getBookmarkedArticleIds(String userId) {
        return bookmarkRepository.findArticleIdsByUserId(userId)
            .stream()
            .collect(Collectors.toSet());
    }
    
    @Transactional
    public void archiveOldArticles() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
        List<ImmigrationNewsArticle> oldArticles = articleRepository
            .findByStatusAndCreatedAtBefore(ImmigrationNewsArticle.Status.ACTIVE, cutoff);
        
        oldArticles.forEach(article -> article.setStatus(ImmigrationNewsArticle.Status.ARCHIVED));
        articleRepository.saveAll(oldArticles);
        
        log.info("Archived {} old articles", oldArticles.size());
    }
}