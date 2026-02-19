package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomListing;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RoomListingSummary {
    private UUID id;
    private String title;
    private RoomListing.ListingFor listingFor;
    private RoomListing.RoomType roomType;
    private BigDecimal rentMonthly;
    private String approxAreaLabel;
    private BigDecimal latApprox;
    private BigDecimal lngApprox;
    private BigDecimal latExact;
    private BigDecimal lngExact;
    private boolean locationExactEnabled;
    private List<String> imageUrls;
    private RoomListing.Status status;
    private LocalDateTime lastActivityAt;

    public RoomListingSummary(RoomListing listing) {
        this.id = listing.getId();
        this.title = listing.getTitle();
        this.listingFor = listing.getListingFor();
        this.roomType = listing.getRoomType();
        this.rentMonthly = listing.getRentMonthly();
        this.approxAreaLabel = listing.getApproxAreaLabel();
        this.latApprox = listing.getLatApprox();
        this.lngApprox = listing.getLngApprox();
        this.latExact = listing.getLatExact();
        this.lngExact = listing.getLngExact();
        this.locationExactEnabled = listing.isLocationExactEnabled();
        this.imageUrls = listing.getImageUrls();
        this.status = listing.getStatus();
        this.lastActivityAt = listing.getLastActivityAt();
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public RoomListing.ListingFor getListingFor() {
        return listingFor;
    }

    public RoomListing.RoomType getRoomType() {
        return roomType;
    }

    public BigDecimal getRentMonthly() {
        return rentMonthly;
    }

    public String getApproxAreaLabel() {
        return approxAreaLabel;
    }

    public BigDecimal getLatApprox() {
        return latApprox;
    }

    public BigDecimal getLngApprox() {
        return lngApprox;
    }

    public BigDecimal getLatExact() {
        return latExact;
    }

    public BigDecimal getLngExact() {
        return lngExact;
    }

    public boolean isLocationExactEnabled() {
        return locationExactEnabled;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public RoomListing.Status getStatus() {
        return status;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }
}
