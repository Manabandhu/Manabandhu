package com.manabandhu.service.immigration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImmigrationNewsScheduler {
    
    private final NewsIngestionService ingestionService;
    private final ImmigrationNewsService newsService;
    
    @Scheduled(fixedRate = 3600000) // Every hour
    public void ingestNews() {
        log.info("Starting scheduled news ingestion");
        try {
            ingestionService.ingestNewsFromAllSources();
            log.info("Completed scheduled news ingestion");
        } catch (Exception e) {
            log.error("Failed to complete scheduled news ingestion", e);
        }
    }
    
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    public void archiveOldNews() {
        log.info("Starting scheduled news archival");
        try {
            newsService.archiveOldArticles();
            log.info("Completed scheduled news archival");
        } catch (Exception e) {
            log.error("Failed to complete scheduled news archival", e);
        }
    }
}