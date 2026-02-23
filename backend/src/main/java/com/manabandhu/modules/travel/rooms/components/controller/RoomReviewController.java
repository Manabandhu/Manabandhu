package com.manabandhu.modules.travel.rooms.components.controller;

import com.manabandhu.modules.travel.rooms.components.dto.RoomReviewRequest;
import com.manabandhu.modules.travel.rooms.components.dto.RoomReviewResponse;
import com.manabandhu.modules.travel.rooms.components.dto.RoomReviewUpdateRequest;
import com.manabandhu.modules.travel.rooms.components.model.RoomReview;
import com.manabandhu.shared.utils.RoomReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomReviewController {
    private final RoomReviewService roomReviewService;

    @Autowired
    public RoomReviewController(RoomReviewService roomReviewService) {
        this.roomReviewService = roomReviewService;
    }

    @PostMapping("/listings/{id}/reviews")
    public ResponseEntity<RoomReviewResponse> createReview(
            @PathVariable UUID id,
            @Valid @RequestBody RoomReviewRequest request,
            Authentication authentication) {
        String reviewerId = authentication.getName();
        RoomReview review = roomReviewService.createReview(id, reviewerId, request);
        return ResponseEntity.ok(new RoomReviewResponse(review));
    }

    @GetMapping("/listings/{id}/reviews")
    public ResponseEntity<List<RoomReviewResponse>> getReviews(@PathVariable UUID id) {
        List<RoomReviewResponse> reviews = roomReviewService.getReviews(id).stream()
                .map(RoomReviewResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<RoomReviewResponse> updateReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody RoomReviewUpdateRequest request,
            Authentication authentication) {
        String reviewerId = authentication.getName();
        RoomReview review = roomReviewService.updateReview(reviewId, reviewerId, request);
        return ResponseEntity.ok(new RoomReviewResponse(review));
    }

    @PostMapping("/reviews/{reviewId}/flag")
    public ResponseEntity<RoomReviewResponse> flagReview(@PathVariable UUID reviewId) {
        RoomReview review = roomReviewService.flagReview(reviewId);
        return ResponseEntity.ok(new RoomReviewResponse(review));
    }
}
