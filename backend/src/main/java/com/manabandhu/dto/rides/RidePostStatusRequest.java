package com.manabandhu.dto.rides;

import com.manabandhu.model.ride.RidePost;
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
