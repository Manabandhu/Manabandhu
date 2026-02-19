package com.manabandhu.modules.travel.rides.components.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RidePostScheduler {
    private final RidePostService ridePostService;

    public RidePostScheduler(RidePostService ridePostService) {
        this.ridePostService = ridePostService;
    }

    @Scheduled(cron = "0 0 */3 * * *")
    public void autoArchiveExpiredPosts() {
        ridePostService.autoArchiveExpiredPosts();
    }
}
