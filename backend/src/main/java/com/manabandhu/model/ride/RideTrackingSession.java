package com.manabandhu.model.ride;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ride_tracking_sessions")
public class RideTrackingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ridePostId;

    @Column(nullable = false)
    private String driverUserId;

    @Column(nullable = false)
    private String riderUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Column
    private LocalDateTime endedAt;

    @Column
    private LocalDateTime lastLocationAt;

    @Column(precision = 10, scale = 7)
    private BigDecimal lastLat;

    @Column(precision = 10, scale = 7)
    private BigDecimal lastLng;

    @Column
    private Integer etaMinutes;

    @Column(precision = 8, scale = 2)
    private BigDecimal distanceRemainingMiles;

    public enum Status {
        ACTIVE,
        ENDED,
        CANCELLED
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

    public String getDriverUserId() {
        return driverUserId;
    }

    public void setDriverUserId(String driverUserId) {
        this.driverUserId = driverUserId;
    }

    public String getRiderUserId() {
        return riderUserId;
    }

    public void setRiderUserId(String riderUserId) {
        this.riderUserId = riderUserId;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public LocalDateTime getLastLocationAt() {
        return lastLocationAt;
    }

    public void setLastLocationAt(LocalDateTime lastLocationAt) {
        this.lastLocationAt = lastLocationAt;
    }

    public BigDecimal getLastLat() {
        return lastLat;
    }

    public void setLastLat(BigDecimal lastLat) {
        this.lastLat = lastLat;
    }

    public BigDecimal getLastLng() {
        return lastLng;
    }

    public void setLastLng(BigDecimal lastLng) {
        this.lastLng = lastLng;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(Integer etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public BigDecimal getDistanceRemainingMiles() {
        return distanceRemainingMiles;
    }

    public void setDistanceRemainingMiles(BigDecimal distanceRemainingMiles) {
        this.distanceRemainingMiles = distanceRemainingMiles;
    }
}
