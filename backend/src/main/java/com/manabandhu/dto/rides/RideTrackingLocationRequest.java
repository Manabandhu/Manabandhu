package com.manabandhu.dto.rides;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class RideTrackingLocationRequest {
    @NotNull
    private BigDecimal lat;

    @NotNull
    private BigDecimal lng;

    public BigDecimal getLat() {
        return lat;
    }

    public void setLat(BigDecimal lat) {
        this.lat = lat;
    }

    public BigDecimal getLng() {
        return lng;
    }

    public void setLng(BigDecimal lng) {
        this.lng = lng;
    }
}
