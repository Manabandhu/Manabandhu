package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomReview;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class RoomReviewRequest {
    @NotNull
    private RoomReview.ReviewType type;

    @Min(1)
    @Max(5)
    private int rating;

    private List<String> tags;

    private String comment;

    public RoomReview.ReviewType getType() {
        return type;
    }

    public void setType(RoomReview.ReviewType type) {
        this.type = type;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
