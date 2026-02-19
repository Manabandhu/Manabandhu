package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomListing;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PriceAlertRequest {
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private RoomListing.RoomType roomType;
    private RoomListing.ListingFor listingFor;
    private List<String> amenities;
    private BigDecimal minLat;
    private BigDecimal maxLat;
    private BigDecimal minLng;
    private BigDecimal maxLng;
    private String areaLabel;
    private LocalDate availableBy;

    public BigDecimal getMinRent() {
        return minRent;
    }

    public void setMinRent(BigDecimal minRent) {
        this.minRent = minRent;
    }

    public BigDecimal getMaxRent() {
        return maxRent;
    }

    public void setMaxRent(BigDecimal maxRent) {
        this.maxRent = maxRent;
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
}

