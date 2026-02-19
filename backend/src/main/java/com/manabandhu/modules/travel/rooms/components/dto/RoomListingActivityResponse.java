package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomListingActivity;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class RoomListingActivityResponse {
    private UUID id;
    private UUID listingId;
    private String actorUserId;
    private RoomListingActivity.ActivityType type;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;

    public RoomListingActivityResponse(RoomListingActivity activity) {
        this.id = activity.getId();
        this.listingId = activity.getListingId();
        this.actorUserId = activity.getActorUserId();
        this.type = activity.getType();
        this.metadata = activity.getMetadata();
        this.createdAt = activity.getCreatedAt();
    }

    public UUID getId() {
        return id;
    }

    public UUID getListingId() {
        return listingId;
    }

    public String getActorUserId() {
        return actorUserId;
    }

    public RoomListingActivity.ActivityType getType() {
        return type;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
