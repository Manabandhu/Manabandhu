package com.manabandhu.dto.rides;

import com.manabandhu.model.ride.RidePost;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class RidePostResponse {
    private UUID id;
    private RidePost.PostType postType;
    private String ownerUserId;
    private String title;
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private String pickupLabel;
    private BigDecimal dropLat;
    private BigDecimal dropLng;
    private String dropLabel;
    private BigDecimal routeDistanceMiles;
    private String routePolyline;
    private LocalDateTime departAt;
    private Integer seatsTotal;
    private Integer seatsNeeded;
    private RideRequirements requirements;
    private RidePost.PricingMode pricingMode;
    private BigDecimal priceFixed;
    private BigDecimal pricePerMile;
    private BigDecimal priceTotal;
    private RidePost.Status status;
    private String bookedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime expiresAt;
    private LocalDateTime archivedAt;

    public RidePostResponse(RidePost post) {
        this.id = post.getId();
        this.postType = post.getPostType();
        this.ownerUserId = post.getOwnerUserId();
        this.title = post.getTitle();
        this.pickupLat = post.getPickupLat();
        this.pickupLng = post.getPickupLng();
        this.pickupLabel = post.getPickupLabel();
        this.dropLat = post.getDropLat();
        this.dropLng = post.getDropLng();
        this.dropLabel = post.getDropLabel();
        this.routeDistanceMiles = post.getRouteDistanceMiles();
        this.routePolyline = post.getRoutePolyline();
        this.departAt = post.getDepartAt();
        this.seatsTotal = post.getSeatsTotal();
        this.seatsNeeded = post.getSeatsNeeded();
        this.requirements = toRequirements(post.getRequirements());
        this.pricingMode = post.getPricingMode();
        this.priceFixed = post.getPriceFixed();
        this.pricePerMile = post.getPricePerMile();
        this.priceTotal = post.getPriceTotal();
        this.status = post.getStatus();
        this.bookedByUserId = post.getBookedByUserId();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.lastActivityAt = post.getLastActivityAt();
        this.expiresAt = post.getExpiresAt();
        this.archivedAt = post.getArchivedAt();
    }

    private RideRequirements toRequirements(Map<String, Object> requirements) {
        if (requirements == null) {
            return null;
        }
        RideRequirements result = new RideRequirements();
        Object people = requirements.get("peopleCount");
        if (people instanceof Number number) {
            result.setPeopleCount(number.intValue());
        }
        Object luggage = requirements.get("luggage");
        if (luggage instanceof Boolean value) {
            result.setLuggage(value);
        }
        Object pets = requirements.get("pets");
        if (pets instanceof Boolean value) {
            result.setPets(value);
        }
        Object notes = requirements.get("notes");
        if (notes instanceof String value) {
            result.setNotes(value);
        }
        return result;
    }

    public UUID getId() {
        return id;
    }

    public RidePost.PostType getPostType() {
        return postType;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public String getTitle() {
        return title;
    }

    public BigDecimal getPickupLat() {
        return pickupLat;
    }

    public BigDecimal getPickupLng() {
        return pickupLng;
    }

    public String getPickupLabel() {
        return pickupLabel;
    }

    public BigDecimal getDropLat() {
        return dropLat;
    }

    public BigDecimal getDropLng() {
        return dropLng;
    }

    public String getDropLabel() {
        return dropLabel;
    }

    public BigDecimal getRouteDistanceMiles() {
        return routeDistanceMiles;
    }

    public String getRoutePolyline() {
        return routePolyline;
    }

    public LocalDateTime getDepartAt() {
        return departAt;
    }

    public Integer getSeatsTotal() {
        return seatsTotal;
    }

    public Integer getSeatsNeeded() {
        return seatsNeeded;
    }

    public RideRequirements getRequirements() {
        return requirements;
    }

    public RidePost.PricingMode getPricingMode() {
        return pricingMode;
    }

    public BigDecimal getPriceFixed() {
        return priceFixed;
    }

    public BigDecimal getPricePerMile() {
        return pricePerMile;
    }

    public BigDecimal getPriceTotal() {
        return priceTotal;
    }

    public RidePost.Status getStatus() {
        return status;
    }

    public String getBookedByUserId() {
        return bookedByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }
}
