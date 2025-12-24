package com.manabandhu.service.immigration;

import com.manabandhu.model.immigration.ImmigrationNewsArticle;
import com.manabandhu.model.immigration.ImmigrationNewsSource;
import com.manabandhu.repository.ImmigrationNewsArticleRepository;
import com.manabandhu.repository.ImmigrationNewsSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsIngestionService {
    
    private final ImmigrationNewsSourceRepository sourceRepository;
    private final ImmigrationNewsArticleRepository articleRepository;
    private final ImmigrationNewsService newsService;
    private final RestTemplate restTemplate;
    
    private static final Pattern VISA_PATTERN = Pattern.compile("\\b(H-?1B|F-?1|OPT|STEM|H-?4|L-?1|B-?1|B-?2|Green Card|GC|I-?140|I-?485)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern COUNTRY_PATTERN = Pattern.compile("\\b(India|China|Mexico|Philippines|Vietnam|South Korea|Canada|UK|Germany|France)\\b", Pattern.CASE_INSENSITIVE);
    
    @Transactional
    public void ingestNewsFromAllSources() {
        List<ImmigrationNewsSource> enabledSources = sourceRepository.findByEnabledTrue();
        
        for (ImmigrationNewsSource source : enabledSources) {
            try {
                ingestFromSource(source);
            } catch (Exception e) {
                log.error("Failed to ingest from source: {}", source.getName(), e);
            }
        }
    }
    
    private void ingestFromSource(ImmigrationNewsSource source) {
        log.info("Ingesting news from source: {}", source.getName());
        
        // This is a simplified implementation
        // In production, this would handle RSS feeds, APIs, etc.
        List<RawNewsItem> rawItems = fetchRawNewsItems(source);
        
        for (RawNewsItem rawItem : rawItems) {
            if (!articleRepository.existsBySourceUrlAndStatus(rawItem.url, ImmigrationNewsArticle.Status.ACTIVE)) {
                ImmigrationNewsArticle article = processRawItem(rawItem, source);
                if (article != null) {
                    articleRepository.save(article);
                    
                    // Process for breaking news notifications
                    newsService.processBreakingNews(article);
                }
            }
        }
    }
    
    private List<RawNewsItem> fetchRawNewsItems(ImmigrationNewsSource source) {
        // Simplified mock implementation
        // In production, this would fetch from RSS feeds, APIs, etc.
        return List.of(
            new RawNewsItem(
                "USCIS Updates Processing Times for I-485 Applications",
                "USCIS has updated processing times for Form I-485, Application to Adjust Status to Permanent Resident.",
                source.getBaseUrl() + "/news/processing-times-update",
                LocalDateTime.now().minusHours(2)
            )
        );
    }
    
    private ImmigrationNewsArticle processRawItem(RawNewsItem rawItem, ImmigrationNewsSource source) {
        try {
            ImmigrationNewsArticle article = new ImmigrationNewsArticle();
            article.setTitle(rawItem.title);
            article.setSummary(generateSummary(rawItem.content));
            article.setContent(rawItem.content);
            article.setSourceName(source.getName());
            article.setSourceUrl(rawItem.url);
            article.setSourceType(source.getType());
            article.setPublishedAt(rawItem.publishedAt);
            article.setIngestedAt(LocalDateTime.now());
            
            // Extract visa categories
            article.setVisaCategories(extractVisaCategories(rawItem.title + " " + rawItem.content));
            
            // Extract countries
            article.setCountriesAffected(extractCountries(rawItem.title + " " + rawItem.content));
            
            // Determine impact level
            article.setImpactLevel(determineImpactLevel(rawItem.title, rawItem.content, source.getType()));
            
            // Check if breaking news
            article.setIsBreaking(isBreakingNews(rawItem.title, rawItem.content));
            
            // Auto-verify official sources
            article.setIsVerified(source.getType() == ImmigrationNewsArticle.SourceType.OFFICIAL);
            
            // Generate tags
            article.setTags(generateTags(rawItem.title, rawItem.content));
            
            return article;
        } catch (Exception e) {
            log.error("Failed to process raw item: {}", rawItem.title, e);
            return null;
        }
    }
    
    private String generateSummary(String content) {
        if (content == null || content.length() <= 200) {
            return content;
        }
        return content.substring(0, 197) + "...";
    }
    
    private String extractVisaCategories(String text) {
        return VISA_PATTERN.matcher(text)
            .results()
            .map(match -> match.group().toUpperCase())
            .distinct()
            .reduce((a, b) -> a + "," + b)
            .map(categories -> "[\"" + categories.replace(",", "\",\"") + "\"]")
            .orElse("[]");
    }
    
    private String extractCountries(String text) {
        return COUNTRY_PATTERN.matcher(text)
            .results()
            .map(match -> match.group())
            .distinct()
            .reduce((a, b) -> a + "," + b)
            .map(countries -> "[\"" + countries.replace(",", "\",\"") + "\"]")
            .orElse("[]");
    }
    
    private ImmigrationNewsArticle.ImpactLevel determineImpactLevel(String title, String content, ImmigrationNewsArticle.SourceType sourceType) {
        String text = (title + " " + content).toLowerCase();
        
        if (text.contains("emergency") || text.contains("immediate") || text.contains("urgent")) {
            return ImmigrationNewsArticle.ImpactLevel.CRITICAL;
        }
        
        if (text.contains("policy change") || text.contains("new rule") || text.contains("deadline")) {
            return ImmigrationNewsArticle.ImpactLevel.HIGH;
        }
        
        if (text.contains("clarification") || text.contains("guidance") || text.contains("update")) {
            return ImmigrationNewsArticle.ImpactLevel.MEDIUM;
        }
        
        return ImmigrationNewsArticle.ImpactLevel.LOW;
    }
    
    private boolean isBreakingNews(String title, String content) {
        String text = (title + " " + content).toLowerCase();
        return text.contains("breaking") || text.contains("urgent") || text.contains("immediate");
    }
    
    private String generateTags(String title, String content) {
        // Simplified tag generation
        return "[\"immigration\",\"policy\",\"update\"]";
    }
    
    private static class RawNewsItem {
        final String title;
        final String content;
        final String url;
        final LocalDateTime publishedAt;
        
        RawNewsItem(String title, String content, String url, LocalDateTime publishedAt) {
            this.title = title;
            this.content = content;
            this.url = url;
            this.publishedAt = publishedAt;
        }
    }
}