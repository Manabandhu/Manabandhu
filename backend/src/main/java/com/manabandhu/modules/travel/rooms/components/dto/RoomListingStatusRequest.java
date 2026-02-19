package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomListing;
import jakarta.validation.constraints.NotNull;

public class RoomListingStatusRequest {
    @NotNull
    private RoomListing.Status status;

    public RoomListing.Status getStatus() {
        return status;
    }

    public void setStatus(RoomListing.Status status) {
        this.status = status;
    }
}
