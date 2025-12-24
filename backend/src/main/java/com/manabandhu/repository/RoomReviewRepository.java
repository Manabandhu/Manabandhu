package com.manabandhu.repository;

import com.manabandhu.model.room.RoomReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomReviewRepository extends JpaRepository<RoomReview, UUID> {
    Optional<RoomReview> findByListingIdAndReviewerUserIdAndType(UUID listingId, String reviewerUserId, RoomReview.ReviewType type);

    List<RoomReview> findByListingIdOrderByCreatedAtDesc(UUID listingId);
}
