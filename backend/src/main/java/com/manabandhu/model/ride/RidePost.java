package com.manabandhu.model.ride;

import com.manabandhu.model.room.JsonMapConverter;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ride_posts")
@EntityListeners(AuditingEntityListener.class)
public class RidePost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType postType;

    @Column(nullable = false)
    private String ownerUserId;

    @Column
    private String title;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal pickupLat;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal pickupLng;

    @Column(nullable = false)
    private String pickupLabel;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal dropLat;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal dropLng;

    @Column(nullable = false)
    private String dropLabel;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal routeDistanceMiles;

    @Column(columnDefinition = "TEXT")
    private String routePolyline;

    @Column(nullable = false)
    private LocalDateTime departAt;

    @Column
    private Integer seatsTotal;

    @Column
    private Integer seatsNeeded;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "TEXT")
    private Map<String, Object> requirements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PricingMode pricingMode;

    @Column(precision = 10, scale = 2)
    private BigDecimal priceFixed;

    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerMile;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column
    private String bookedByUserId;

    @CreatedDate
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private LocalDateTime lastActivityAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime archivedAt;

    @Version
    private long version;

    public enum PostType {
        OFFER,
        REQUEST
    }

    public enum PricingMode {
        FIXED,
        PER_MILE
    }

    public enum Status {
        OPEN,
        IN_TALKS,
        BOOKED,
        REBOOKED,
        CANCELLED,
        ARCHIVED
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PostType getPostType() {
        return postType;
    }

    public void setPostType(PostType postType) {
        this.postType = postType;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(String ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getPickupLat() {
        return pickupLat;
    }

    public void setPickupLat(BigDecimal pickupLat) {
        this.pickupLat = pickupLat;
    }

    public BigDecimal getPickupLng() {
        return pickupLng;
    }

    public void setPickupLng(BigDecimal pickupLng) {
        this.pickupLng = pickupLng;
    }

    public String getPickupLabel() {
        return pickupLabel;
    }

    public void setPickupLabel(String pickupLabel) {
        this.pickupLabel = pickupLabel;
    }

    public BigDecimal getDropLat() {
        return dropLat;
    }

    public void setDropLat(BigDecimal dropLat) {
        this.dropLat = dropLat;
    }

    public BigDecimal getDropLng() {
        return dropLng;
    }

    public void setDropLng(BigDecimal dropLng) {
        this.dropLng = dropLng;
    }

    public String getDropLabel() {
        return dropLabel;
    }

    public void setDropLabel(String dropLabel) {
        this.dropLabel = dropLabel;
    }

    public BigDecimal getRouteDistanceMiles() {
        return routeDistanceMiles;
    }

    public void setRouteDistanceMiles(BigDecimal routeDistanceMiles) {
        this.routeDistanceMiles = routeDistanceMiles;
    }

    public String getRoutePolyline() {
        return routePolyline;
    }

    public void setRoutePolyline(String routePolyline) {
        this.routePolyline = routePolyline;
    }

    public LocalDateTime getDepartAt() {
        return departAt;
    }

    public void setDepartAt(LocalDateTime departAt) {
        this.departAt = departAt;
    }

    public Integer getSeatsTotal() {
        return seatsTotal;
    }

    public void setSeatsTotal(Integer seatsTotal) {
        this.seatsTotal = seatsTotal;
    }

    public Integer getSeatsNeeded() {
        return seatsNeeded;
    }

    public void setSeatsNeeded(Integer seatsNeeded) {
        this.seatsNeeded = seatsNeeded;
    }

    public Map<String, Object> getRequirements() {
        return requirements;
    }

    public void setRequirements(Map<String, Object> requirements) {
        this.requirements = requirements;
    }

    public PricingMode getPricingMode() {
        return pricingMode;
    }

    public void setPricingMode(PricingMode pricingMode) {
        this.pricingMode = pricingMode;
    }

    public BigDecimal getPriceFixed() {
        return priceFixed;
    }

    public void setPriceFixed(BigDecimal priceFixed) {
        this.priceFixed = priceFixed;
    }

    public BigDecimal getPricePerMile() {
        return pricePerMile;
    }

    public void setPricePerMile(BigDecimal pricePerMile) {
        this.pricePerMile = pricePerMile;
    }

    public BigDecimal getPriceTotal() {
        return priceTotal;
    }

    public void setPriceTotal(BigDecimal priceTotal) {
        this.priceTotal = priceTotal;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getBookedByUserId() {
        return bookedByUserId;
    }

    public void setBookedByUserId(String bookedByUserId) {
        this.bookedByUserId = bookedByUserId;
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

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }
}
