package com.manabandhu.model.ride;

import com.manabandhu.model.room.JsonMapConverter;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ride_post_activities")
public class RidePostActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ridePostId;

    @Column(nullable = false)
    private String actorUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "TEXT")
    private Map<String, Object> metadata;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum ActivityType {
        CREATED,
        UPDATED,
        CHAT_STARTED,
        STATUS_CHANGED,
        BOOKED,
        REBOOKED,
        CANCELLED,
        AUTO_ARCHIVED,
        LOCATION_SHARED
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRidePostId() {
        return ridePostId;
    }

    public void setRidePostId(UUID ridePostId) {
        this.ridePostId = ridePostId;
    }

    public String getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(String actorUserId) {
        this.actorUserId = actorUserId;
    }

    public ActivityType getType() {
        return type;
    }

    public void setType(ActivityType type) {
        this.type = type;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
