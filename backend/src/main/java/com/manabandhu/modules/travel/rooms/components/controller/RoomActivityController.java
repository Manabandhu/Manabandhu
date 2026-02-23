package com.manabandhu.modules.travel.rooms.components.controller;

import com.manabandhu.modules.travel.rooms.components.dto.RoomListingActivityResponse;
import com.manabandhu.shared.utils.RoomListingActivityService;
import com.manabandhu.shared.utils.RoomListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/activities")
@CrossOrigin(origins = "*")
public class RoomActivityController {
    private final RoomListingActivityService activityService;
    private final RoomListingService roomListingService;

    @Autowired
    public RoomActivityController(RoomListingActivityService activityService, RoomListingService roomListingService) {
        this.activityService = activityService;
        this.roomListingService = roomListingService;
    }

    @GetMapping("/home")
    public ResponseEntity<Page<RoomListingActivityResponse>> getHomeActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RoomListingActivityResponse> response = activityService.getHomeActivities(pageable)
                .map(RoomListingActivityResponse::new);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<RoomListingActivityResponse>> getMyActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        List<UUID> listingIds = roomListingService.getListingIdsForOwner(userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<RoomListingActivityResponse> response = activityService.getActivitiesForListings(listingIds, pageable)
                .map(RoomListingActivityResponse::new);
        return ResponseEntity.ok(response);
    }
}
