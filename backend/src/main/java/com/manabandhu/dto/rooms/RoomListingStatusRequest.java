package com.manabandhu.dto.rooms;

import com.manabandhu.model.room.RoomListing;
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
