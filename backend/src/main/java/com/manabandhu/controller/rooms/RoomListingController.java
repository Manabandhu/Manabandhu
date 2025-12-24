package com.manabandhu.controller.rooms;

import com.manabandhu.dto.rooms.*;
import com.manabandhu.model.room.RoomListing;
import com.manabandhu.service.RoomListingService;
import com.manabandhu.service.RoomReviewService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomListingController {
    private final RoomListingService roomListingService;
    private final RoomReviewService roomReviewService;

    @Autowired
    public RoomListingController(RoomListingService roomListingService, RoomReviewService roomReviewService) {
        this.roomListingService = roomListingService;
        this.roomReviewService = roomReviewService;
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
    public ResponseEntity<RoomListingResponse> getListing(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RoomListing listing = roomListingService.getListing(id);
        boolean owner = listing.getOwnerUserId().equals(userId);
        if (listing.getStatus() == RoomListing.Status.DELETED && !owner) {
            throw new java.util.NoSuchElementException("Listing not found");
        }
        boolean canReview = !owner && roomReviewService.isEligible(id, userId);
        return ResponseEntity.ok(new RoomListingResponse(listing, owner, canReview));
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
