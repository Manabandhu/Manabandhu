package com.manabandhu.modules.travel.rides.components.dto;

import com.manabandhu.modules.travel.rides.components.model.RidePost;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RidePostSummary {
    private UUID id;
    private RidePost.PostType postType;
    private String title;
    private String pickupLabel;
    private String dropLabel;
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropLat;
    private BigDecimal dropLng;
    private BigDecimal routeDistanceMiles;
    private String routePolyline;
    private LocalDateTime departAt;
    private Integer seatsTotal;
    private Integer seatsNeeded;
    private RidePost.PricingMode pricingMode;
    private BigDecimal priceTotal;
    private RidePost.Status status;
    private LocalDateTime expiresAt;

    public RidePostSummary(RidePost post) {
        this.id = post.getId();
        this.postType = post.getPostType();
        this.title = post.getTitle();
        this.pickupLabel = post.getPickupLabel();
        this.dropLabel = post.getDropLabel();
        this.pickupLat = post.getPickupLat();
        this.pickupLng = post.getPickupLng();
        this.dropLat = post.getDropLat();
        this.dropLng = post.getDropLng();
        this.routeDistanceMiles = post.getRouteDistanceMiles();
        this.routePolyline = post.getRoutePolyline();
        this.departAt = post.getDepartAt();
        this.seatsTotal = post.getSeatsTotal();
        this.seatsNeeded = post.getSeatsNeeded();
        this.pricingMode = post.getPricingMode();
        this.priceTotal = post.getPriceTotal();
        this.status = post.getStatus();
        this.expiresAt = post.getExpiresAt();
    }

    public UUID getId() {
        return id;
    }

    public RidePost.PostType getPostType() {
        return postType;
    }

    public String getTitle() {
        return title;
    }

    public String getPickupLabel() {
        return pickupLabel;
    }

    public String getDropLabel() {
        return dropLabel;
    }

    public BigDecimal getPickupLat() {
        return pickupLat;
    }

    public BigDecimal getPickupLng() {
        return pickupLng;
    }

    public BigDecimal getDropLat() {
        return dropLat;
    }

    public BigDecimal getDropLng() {
        return dropLng;
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

    public RidePost.PricingMode getPricingMode() {
        return pricingMode;
    }

    public BigDecimal getPriceTotal() {
        return priceTotal;
    }

    public RidePost.Status getStatus() {
        return status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
