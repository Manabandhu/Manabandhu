package com.manabandhu.modules.travel.rooms.components.controller;

import com.manabandhu.modules.travel.rooms.components.dto.*;
import com.manabandhu.modules.travel.rooms.components.model.RoomListing;
import com.manabandhu.shared.utils.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomListingController {
    private final RoomListingService roomListingService;
    private final RoomReviewService roomReviewService;
    private final SavedListingService savedListingService;
    private final ListingViewService listingViewService;
    private final PriceAlertService priceAlertService;
    private final ListingReportService listingReportService;

    @Autowired
    public RoomListingController(
            RoomListingService roomListingService,
            RoomReviewService roomReviewService,
            SavedListingService savedListingService,
            ListingViewService listingViewService,
            PriceAlertService priceAlertService,
            ListingReportService listingReportService) {
        this.roomListingService = roomListingService;
        this.roomReviewService = roomReviewService;
        this.savedListingService = savedListingService;
        this.listingViewService = listingViewService;
        this.priceAlertService = priceAlertService;
        this.listingReportService = listingReportService;
    }

    @PostMapping("/listings")
    public ResponseEntity<RoomListingResponse> createListing(
            @Valid @RequestBody RoomListingRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RoomListing listing = roomListingService.createListing(userId, request);
        return ResponseEntity.ok(new RoomListingResponse(listing, true, false));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<RoomListingResponse> updateListing(
            @PathVariable UUID id,
            @Valid @RequestBody RoomListingRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RoomListing listing = roomListingService.updateListing(userId, id, request);
        return ResponseEntity.ok(new RoomListingResponse(listing, true, false));
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        roomListingService.deleteListing(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/listings/{id}/repost")
    public ResponseEntity<RoomListingResponse> repostListing(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RoomListing listing = roomListingService.repostListing(userId, id);
        return ResponseEntity.ok(new RoomListingResponse(listing, true, false));
    }

    @PostMapping("/listings/{id}/status")
    public ResponseEntity<RoomListingResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody RoomListingStatusRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RoomListing listing = roomListingService.updateStatus(userId, id, request.getStatus());
        return ResponseEntity.ok(new RoomListingResponse(listing, true, false));
    }

    @GetMapping("/listings")
    public ResponseEntity<Page<RoomListingSummary>> getListings(
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) RoomListing.RoomType roomType,
            @RequestParam(required = false) RoomListing.ListingFor listingFor,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableBy,
            @RequestParam(required = false) BigDecimal minLat,
            @RequestParam(required = false) BigDecimal maxLat,
            @RequestParam(required = false) BigDecimal minLng,
            @RequestParam(required = false) BigDecimal maxLng,
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng,
            @RequestParam(required = false) BigDecimal radiusKm,
            @RequestParam(required = false) List<RoomListing.Status> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        BoundingBox box = BoundingBox.from(lat, lng, radiusKm, minLat, maxLat, minLng, maxLng);
        RoomListingService.RoomListingSearch search = new RoomListingService.RoomListingSearch(
                minRent,
                maxRent,
                roomType,
                listingFor,
                amenities,
                availableBy,
                box.minLat,
                box.maxLat,
                box.minLng,
                box.maxLng,
                status,
                false
        );
        Pageable pageable = PageRequest.of(page, size);
        Page<RoomListingSummary> response = roomListingService.getListings(search, pageable)
                .map(RoomListingSummary::new);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/listings/me")
    public ResponseEntity<Page<RoomListingSummary>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<RoomListingSummary> response = roomListingService.getMyListings(userId, pageable)
                .map(RoomListingSummary::new);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<RoomListingResponse> getListing(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request) {
        String userId = authentication != null ? authentication.getName() : null;
        RoomListing listing = roomListingService.getListing(id);
        boolean owner = userId != null && listing.getOwnerUserId().equals(userId);
        if (listing.getStatus() == RoomListing.Status.DELETED && !owner) {
            throw new java.util.NoSuchElementException("Listing not found");
        }
        boolean canReview = userId != null && !owner && roomReviewService.isEligible(id, userId);
        
        // Track view
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        listingViewService.recordView(id, userId, ipAddress, userAgent);
        
        // Check if saved
        boolean isSaved = userId != null && savedListingService.isSaved(userId, id);
        
        // Get view count
        long viewCount = listingViewService.getViewCount(id);
        
        RoomListingResponse response = new RoomListingResponse(listing, owner, canReview);
        response.setSaved(isSaved);
        response.setViewCount(viewCount);
        
        return ResponseEntity.ok(response);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/listings/{id}/chat/start")
    public ResponseEntity<ChatStartResponse> startChat(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        String chatThreadId = roomListingService.startChat(id, userId);
        return ResponseEntity.ok(new ChatStartResponse(chatThreadId));
    }

    @PostMapping("/chats/{chatThreadId}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable String chatThreadId) {
        roomListingService.heartbeat(chatThreadId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listings/{id}/reviews/eligibility")
    public ResponseEntity<ReviewEligibilityResponse> reviewEligibility(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(new ReviewEligibilityResponse(roomReviewService.isEligible(id, userId)));
    }

    // Saved Listings endpoints
    @PostMapping("/listings/{id}/save")
    public ResponseEntity<Map<String, Object>> saveListing(
            @PathVariable UUID id,
            @RequestParam(required = false) String notes,
            Authentication authentication) {
        String userId = authentication.getName();
        savedListingService.saveListing(userId, id, notes);
        return ResponseEntity.ok(Map.of("saved", true));
    }

    @DeleteMapping("/listings/{id}/save")
    public ResponseEntity<Map<String, Object>> unsaveListing(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication.getName();
        savedListingService.unsaveListing(userId, id);
        return ResponseEntity.ok(Map.of("saved", false));
    }

    @GetMapping("/listings/{id}/saved")
    public ResponseEntity<Map<String, Object>> isSaved(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication.getName();
        boolean saved = savedListingService.isSaved(userId, id);
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    @GetMapping("/listings/saved")
    public ResponseEntity<Page<RoomListingSummary>> getSavedListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<com.manabandhu.modules.travel.rooms.components.model.SavedListing> saved = savedListingService.getSavedListings(userId, pageable);
        Page<RoomListingSummary> response = saved.map(savedListing -> {
            RoomListing listing = roomListingService.getListing(savedListing.getListingId());
            return new RoomListingSummary(listing);
        });
        return ResponseEntity.ok(response);
    }

    // Price Alerts endpoints
    @PostMapping("/alerts")
    public ResponseEntity<Map<String, Object>> createPriceAlert(
            @Valid @RequestBody PriceAlertRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        com.manabandhu.modules.travel.rooms.components.model.PriceAlert alert = priceAlertService.createAlert(userId, request);
        return ResponseEntity.ok(Map.of("id", alert.getId().toString()));
    }

    @PutMapping("/alerts/{id}")
    public ResponseEntity<Map<String, Object>> updatePriceAlert(
            @PathVariable UUID id,
            @Valid @RequestBody PriceAlertRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        priceAlertService.updateAlert(userId, id, request);
        return ResponseEntity.ok(Map.of("updated", true));
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<Void> deletePriceAlert(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication.getName();
        priceAlertService.deleteAlert(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/alerts/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivatePriceAlert(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication.getName();
        priceAlertService.deactivateAlert(userId, id);
        return ResponseEntity.ok(Map.of("active", false));
    }

    @GetMapping("/alerts")
    public ResponseEntity<Page<Map<String, Object>>> getPriceAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<com.manabandhu.modules.travel.rooms.components.model.PriceAlert> alerts = priceAlertService.getUserAlerts(userId, pageable);
        Page<Map<String, Object>> response = alerts.map(alert -> Map.of(
                "id", alert.getId().toString(),
                "maxRent", alert.getMaxRent() != null ? alert.getMaxRent() : "",
                "minRent", alert.getMinRent() != null ? alert.getMinRent() : "",
                "roomType", alert.getRoomType() != null ? alert.getRoomType().name() : "",
                "active", alert.isActive(),
                "createdAt", alert.getCreatedAt().toString()
        ));
        return ResponseEntity.ok(response);
    }

    // Reporting endpoints
    @PostMapping("/listings/{id}/report")
    public ResponseEntity<Map<String, Object>> reportListing(
            @PathVariable UUID id,
            @Valid @RequestBody ListingReportRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        listingReportService.createReport(userId, id, request);
        return ResponseEntity.ok(Map.of("reported", true));
    }

    private static class BoundingBox {
        private final BigDecimal minLat;
        private final BigDecimal maxLat;
        private final BigDecimal minLng;
        private final BigDecimal maxLng;

        private BoundingBox(BigDecimal minLat, BigDecimal maxLat, BigDecimal minLng, BigDecimal maxLng) {
            this.minLat = minLat;
            this.maxLat = maxLat;
            this.minLng = minLng;
            this.maxLng = maxLng;
        }

        private static BoundingBox from(BigDecimal lat, BigDecimal lng, BigDecimal radiusKm,
                                        BigDecimal minLat, BigDecimal maxLat, BigDecimal minLng, BigDecimal maxLng) {
            if (lat != null && lng != null && radiusKm != null) {
                BigDecimal delta = radiusKm.divide(BigDecimal.valueOf(111.0), 6, java.math.RoundingMode.HALF_UP);
                return new BoundingBox(lat.subtract(delta), lat.add(delta), lng.subtract(delta), lng.add(delta));
            }
            if (minLat != null && maxLat != null && minLng != null && maxLng != null) {
                return new BoundingBox(minLat, maxLat, minLng, maxLng);
            }
            return new BoundingBox(null, null, null, null);
        }
    }
}
