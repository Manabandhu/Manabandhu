package com.manabandhu.dto.rides;

import com.manabandhu.model.ride.RidePost;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RidePostRequest {
    @NotNull
    private RidePost.PostType postType;

    private String title;

    @NotNull
    private BigDecimal pickupLat;

    @NotNull
    private BigDecimal pickupLng;

    @NotBlank
    private String pickupLabel;

    @NotNull
    private BigDecimal dropLat;

    @NotNull
    private BigDecimal dropLng;

    @NotBlank
    private String dropLabel;

    @NotNull
    private LocalDateTime departAt;

    @Min(1)
    private Integer seatsTotal;

    @Min(1)
    private Integer seatsNeeded;

    @Valid
    private RideRequirements requirements;

    @NotNull
    private RidePost.PricingMode pricingMode;

    @DecimalMin("0.01")
    private BigDecimal priceFixed;

    @DecimalMin("0.01")
    private BigDecimal pricePerMile;

    @DecimalMin("0.01")
    private BigDecimal priceTotal;

    public RidePost.PostType getPostType() {
        return postType;
    }

    public void setPostType(RidePost.PostType postType) {
        this.postType = postType;
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

    public RideRequirements getRequirements() {
        return requirements;
    }

    public void setRequirements(RideRequirements requirements) {
        this.requirements = requirements;
    }

    public RidePost.PricingMode getPricingMode() {
        return pricingMode;
    }

    public void setPricingMode(RidePost.PricingMode pricingMode) {
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
}
