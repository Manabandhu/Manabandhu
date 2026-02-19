package com.manabandhu.shared.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RoomListingScheduler {
    private final RoomListingService roomListingService;
    private final PriceAlertService priceAlertService;

    @Autowired
    public RoomListingScheduler(RoomListingService roomListingService, PriceAlertService priceAlertService) {
        this.roomListingService = roomListingService;
        this.priceAlertService = priceAlertService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void autoHideInactiveListings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        roomListingService.autoHideInactiveListings(cutoff);
    }

    @Scheduled(cron = "0 */30 * * * *") // Every 30 minutes
    public void checkPriceAlerts() {
        priceAlertService.checkAlertsAndNotify();
    }
}
