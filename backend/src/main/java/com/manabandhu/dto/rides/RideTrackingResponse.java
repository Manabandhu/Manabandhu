package com.manabandhu.dto.rides;

import com.manabandhu.model.ride.RideTrackingSession;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RideTrackingResponse {
    private UUID id;
    private UUID ridePostId;
    private String driverUserId;
    private String riderUserId;
    private RideTrackingSession.Status status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime lastLocationAt;
    private BigDecimal lastLat;
    private BigDecimal lastLng;
    private Integer etaMinutes;
    private BigDecimal distanceRemainingMiles;

    public RideTrackingResponse(RideTrackingSession session) {
        this.id = session.getId();
        this.ridePostId = session.getRidePostId();
        this.driverUserId = session.getDriverUserId();
        this.riderUserId = session.getRiderUserId();
        this.status = session.getStatus();
        this.startedAt = session.getStartedAt();
        this.endedAt = session.getEndedAt();
        this.lastLocationAt = session.getLastLocationAt();
        this.lastLat = session.getLastLat();
        this.lastLng = session.getLastLng();
        this.etaMinutes = session.getEtaMinutes();
        this.distanceRemainingMiles = session.getDistanceRemainingMiles();
    }

    public UUID getId() {
        return id;
    }

    public UUID getRidePostId() {
        return ridePostId;
    }

    public String getDriverUserId() {
        return driverUserId;
    }

    public String getRiderUserId() {
        return riderUserId;
    }

    public RideTrackingSession.Status getStatus() {
        return status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public LocalDateTime getLastLocationAt() {
        return lastLocationAt;
    }

    public BigDecimal getLastLat() {
        return lastLat;
    }

    public BigDecimal getLastLng() {
        return lastLng;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public BigDecimal getDistanceRemainingMiles() {
        return distanceRemainingMiles;
    }
}
