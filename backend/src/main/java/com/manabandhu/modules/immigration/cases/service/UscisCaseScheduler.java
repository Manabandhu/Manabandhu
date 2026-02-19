package com.manabandhu.modules.immigration.cases.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UscisCaseScheduler {
    
    private final UscisCaseService uscisCaseService;
    
    @Scheduled(cron = "0 0 8 * * ?") // Daily at 8 AM
    public void refreshAllCases() {
        log.info("Starting daily USCIS case refresh");
        try {
            uscisCaseService.refreshAllActiveCases();
            log.info("Completed daily USCIS case refresh");
        } catch (Exception e) {
            log.error("Failed to complete daily USCIS case refresh", e);
        }
    }
}