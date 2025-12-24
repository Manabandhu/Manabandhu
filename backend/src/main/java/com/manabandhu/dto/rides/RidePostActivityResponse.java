package com.manabandhu.dto.rides;

import com.manabandhu.model.ride.RidePostActivity;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class RidePostActivityResponse {
    private UUID id;
    private UUID ridePostId;
    private String actorUserId;
    private RidePostActivity.ActivityType type;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;

    public RidePostActivityResponse(RidePostActivity activity) {
        this.id = activity.getId();
        this.ridePostId = activity.getRidePostId();
        this.actorUserId = activity.getActorUserId();
        this.type = activity.getType();
        this.metadata = activity.getMetadata();
        this.createdAt = activity.getCreatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getRidePostId() {
        return ridePostId;
    }

    public String getActorUserId() {
        return actorUserId;
    }

    public RidePostActivity.ActivityType getType() {
        return type;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
