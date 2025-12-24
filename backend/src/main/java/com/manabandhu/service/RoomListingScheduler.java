package com.manabandhu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RoomListingScheduler {
    private final RoomListingService roomListingService;

    @Autowired
    public RoomListingScheduler(RoomListingService roomListingService) {
        this.roomListingService = roomListingService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void autoHideInactiveListings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        roomListingService.autoHideInactiveListings(cutoff);
    }
}
