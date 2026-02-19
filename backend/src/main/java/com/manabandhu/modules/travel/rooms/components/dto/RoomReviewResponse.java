package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomReview;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RoomReviewResponse {
    private UUID id;
    private UUID listingId;
    private String reviewerUserId;
    private String revieweeUserId;
    private RoomReview.ReviewType type;
    private int rating;
    private List<String> tags;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean edited;
    private boolean flagged;

    public RoomReviewResponse(RoomReview review) {
        this.id = review.getId();
        this.listingId = review.getListingId();
        this.reviewerUserId = review.getReviewerUserId();
        this.revieweeUserId = review.getRevieweeUserId();
        this.type = review.getType();
        this.rating = review.getRating();
        this.tags = review.getTags();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
        this.edited = review.isEdited();
        this.flagged = review.isFlagged();
    }

    public UUID getId() {
        return id;
    }

    public UUID getListingId() {
        return listingId;
    }

    public String getReviewerUserId() {
        return reviewerUserId;
    }

    public String getRevieweeUserId() {
        return revieweeUserId;
    }

    public RoomReview.ReviewType getType() {
        return type;
    }

    public int getRating() {
        return rating;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public boolean isEdited() {
        return edited;
    }

    public boolean isFlagged() {
        return flagged;
    }
}
