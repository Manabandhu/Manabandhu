package com.manabandhu.controller.ride;

import com.manabandhu.dto.rides.*;
import com.manabandhu.model.ride.RidePost;
import com.manabandhu.model.ride.RideTrackingSession;
import com.manabandhu.repository.RideRequestRepository;
import com.manabandhu.service.ride.RidePostService;
import com.manabandhu.service.ride.RideTrackingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RidePostController {
    private final RidePostService ridePostService;
    private final RideTrackingService rideTrackingService;
    private final RideRequestRepository rideRequestRepository;

    public RidePostController(RidePostService ridePostService, 
                             RideTrackingService rideTrackingService,
                             RideRequestRepository rideRequestRepository) {
        this.ridePostService = ridePostService;
        this.rideTrackingService = rideTrackingService;
        this.rideRequestRepository = rideRequestRepository;
    }

    @PostMapping("/posts")
    public ResponseEntity<RidePostUpsertResponse> createPost(
            @Valid @RequestBody RidePostRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RidePostService.RidePostUpsertResult result = ridePostService.createOrUpdate(userId, request);
        RidePostResponse response = new RidePostResponse(result.post());
        RidePostUpsertResponse.UpsertAction action = switch (result.action()) {
            case CREATED -> RidePostUpsertResponse.UpsertAction.CREATED;
            case UPDATED_EXISTING -> RidePostUpsertResponse.UpsertAction.UPDATED_EXISTING;
            case REBOOKED_FROM_BOOKED -> RidePostUpsertResponse.UpsertAction.REBOOKED_FROM_BOOKED;
        };
        return ResponseEntity.ok(new RidePostUpsertResponse(response, action));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<RidePostResponse> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody RidePostRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RidePost post = ridePostService.updatePost(userId, id, request);
        return ResponseEntity.ok(new RidePostResponse(post));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        ridePostService.cancelPost(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{id}/cancel")
    public ResponseEntity<Void> cancelPost(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        ridePostService.cancelPost(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{id}/repost")
    public ResponseEntity<RidePostResponse> repostPost(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RidePost post = ridePostService.repostPost(userId, id);
        return ResponseEntity.ok(new RidePostResponse(post));
    }

    @PostMapping("/posts/{id}/rebook")
    public ResponseEntity<RidePostResponse> rebookPost(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RidePost post = ridePostService.rebookPost(userId, id);
        return ResponseEntity.ok(new RidePostResponse(post));
    }

    @PostMapping("/posts/{id}/status")
    public ResponseEntity<RidePostResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody RidePostStatusRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RidePost post = ridePostService.updateStatus(userId, id, request.getStatus());
        return ResponseEntity.ok(new RidePostResponse(post));
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<RidePostSummary>> getPosts(
            @RequestParam(required = false) RidePost.PostType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departAfter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departBefore,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng,
            @RequestParam(required = false) BigDecimal radiusMiles,
            @RequestParam(required = false) Boolean luggage,
            @RequestParam(required = false) Boolean pets,
            @RequestParam(required = false) List<RidePost.Status> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        BoundingBox box = BoundingBox.from(lat, lng, radiusMiles);
        RidePostService.RidePostSearch search = new RidePostService.RidePostSearch(
                type,
                status,
                departAfter,
                departBefore,
                minPrice,
                maxPrice,
                seats,
                box.minLat,
                box.maxLat,
                box.minLng,
                box.maxLng,
                luggage,
                pets
        );
        Pageable pageable = PageRequest.of(page, size);
        Page<RidePostSummary> response = ridePostService.getPosts(search, pageable)
                .map(RidePostSummary::new);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/me")
    public ResponseEntity<Page<RidePostSummary>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<RidePostSummary> response = ridePostService.getMyPosts(userId, pageable)
                .map(RidePostSummary::new);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<RidePostResponse> getPost(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RidePost post = ridePostService.getPost(id, userId);
        long requestCount = rideRequestRepository.countByRidePostIdAndStatus(id, 
            com.manabandhu.model.ride.RideRequest.RequestStatus.PENDING);
        RidePostResponse response = new RidePostResponse(post);
        response.setRequestCount(requestCount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/posts/{id}/chat/start")
    public ResponseEntity<RideChatStartResponse> startChat(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        String chatThreadId = ridePostService.startChat(id, userId);
        return ResponseEntity.ok(new RideChatStartResponse(chatThreadId));
    }

    @PostMapping("/chats/{chatThreadId}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable String chatThreadId) {
        ridePostService.heartbeat(chatThreadId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{id}/book")
    public ResponseEntity<RidePostResponse> bookPost(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RidePost post = ridePostService.book(userId, id);
        long requestCount = rideRequestRepository.countByRidePostIdAndStatus(id, 
            com.manabandhu.model.ride.RideRequest.RequestStatus.PENDING);
        RidePostResponse response = new RidePostResponse(post);
        response.setRequestCount(requestCount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/posts/{id}/tracking/start")
    public ResponseEntity<RideTrackingResponse> startTracking(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RideTrackingSession session = rideTrackingService.startTracking(id, userId);
        return ResponseEntity.ok(new RideTrackingResponse(session));
    }

    @PostMapping("/posts/{id}/tracking/location")
    public ResponseEntity<RideTrackingResponse> updateLocation(
            @PathVariable UUID id,
            @Valid @RequestBody RideTrackingLocationRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RideTrackingSession session = rideTrackingService.updateLocation(id, userId, request.getLat(), request.getLng());
        return ResponseEntity.ok(new RideTrackingResponse(session));
    }

    @GetMapping("/posts/{id}/tracking")
    public ResponseEntity<RideTrackingResponse> getTracking(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RideTrackingSession session = rideTrackingService.getTracking(id, userId);
        return ResponseEntity.ok(new RideTrackingResponse(session));
    }

    @PostMapping("/posts/{id}/tracking/end")
    public ResponseEntity<RideTrackingResponse> endTracking(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        RideTrackingSession session = rideTrackingService.endTracking(id, userId);
        return ResponseEntity.ok(new RideTrackingResponse(session));
    }

    @GetMapping("/activities/home")
    public ResponseEntity<Page<RidePostActivityResponse>> getHomeActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RidePostActivityResponse> response = ridePostService.getHomeActivities(pageable)
                .map(RidePostActivityResponse::new);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activities/me")
    public ResponseEntity<Page<RidePostActivityResponse>> getMyActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<RidePostActivityResponse> response = ridePostService.getMyActivities(userId, pageable)
                .map(RidePostActivityResponse::new);
        return ResponseEntity.ok(response);
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

        private static BoundingBox from(BigDecimal lat, BigDecimal lng, BigDecimal radiusMiles) {
            if (lat == null || lng == null || radiusMiles == null) {
                return new BoundingBox(null, null, null, null);
            }
            BigDecimal delta = radiusMiles.divide(BigDecimal.valueOf(69.0), 6, RoundingMode.HALF_UP);
            return new BoundingBox(lat.subtract(delta), lat.add(delta), lng.subtract(delta), lng.add(delta));
        }
    }
}
