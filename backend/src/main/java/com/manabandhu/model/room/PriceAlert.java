package com.manabandhu.model.room;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "price_alerts")
@EntityListeners(AuditingEntityListener.class)
public class PriceAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, name = "user_id")
    private String userId;

    @Column(name = "max_rent")
    private BigDecimal maxRent;

    @Column(name = "min_rent")
    private BigDecimal minRent;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    private RoomListing.RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_for")
    private RoomListing.ListingFor listingFor;

    @ElementCollection
    @CollectionTable(name = "price_alert_amenities", joinColumns = @JoinColumn(name = "alert_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @Column(name = "min_lat", precision = 10, scale = 7)
    private BigDecimal minLat;

    @Column(name = "max_lat", precision = 10, scale = 7)
    private BigDecimal maxLat;

    @Column(name = "min_lng", precision = 10, scale = 7)
    private BigDecimal minLng;

    @Column(name = "max_lng", precision = 10, scale = 7)
    private BigDecimal maxLng;

    @Column(name = "area_label")
    private String areaLabel;

    @Column(name = "available_by")
    private LocalDate availableBy;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "last_notified_at")
    private LocalDateTime lastNotifiedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public BigDecimal getMaxRent() {
        return maxRent;
    }

    public void setMaxRent(BigDecimal maxRent) {
        this.maxRent = maxRent;
    }

    public BigDecimal getMinRent() {
        return minRent;
    }

    public void setMinRent(BigDecimal minRent) {
        this.minRent = minRent;
    }

    public RoomListing.RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomListing.RoomType roomType) {
        this.roomType = roomType;
    }

    public RoomListing.ListingFor getListingFor() {
        return listingFor;
    }

    public void setListingFor(RoomListing.ListingFor listingFor) {
        this.listingFor = listingFor;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public BigDecimal getMinLat() {
        return minLat;
    }

    public void setMinLat(BigDecimal minLat) {
        this.minLat = minLat;
    }

    public BigDecimal getMaxLat() {
        return maxLat;
    }

    public void setMaxLat(BigDecimal maxLat) {
        this.maxLat = maxLat;
    }

    public BigDecimal getMinLng() {
        return minLng;
    }

    public void setMinLng(BigDecimal minLng) {
        this.minLng = minLng;
    }

    public BigDecimal getMaxLng() {
        return maxLng;
    }

    public void setMaxLng(BigDecimal maxLng) {
        this.maxLng = maxLng;
    }

    public String getAreaLabel() {
        return areaLabel;
    }

    public void setAreaLabel(String areaLabel) {
        this.areaLabel = areaLabel;
    }

    public LocalDate getAvailableBy() {
        return availableBy;
    }

    public void setAvailableBy(LocalDate availableBy) {
        this.availableBy = availableBy;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getLastNotifiedAt() {
        return lastNotifiedAt;
    }

    public void setLastNotifiedAt(LocalDateTime lastNotifiedAt) {
        this.lastNotifiedAt = lastNotifiedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

