package com.manabandhu.modules.travel.rides.components.dto;

import com.manabandhu.modules.travel.rides.components.model.RidePost;
import jakarta.validation.constraints.NotNull;

public class RidePostStatusRequest {
    @NotNull
    private RidePost.Status status;

    public RidePost.Status getStatus() {
        return status;
    }

    public void setStatus(RidePost.Status status) {
        this.status = status;
    }
}
