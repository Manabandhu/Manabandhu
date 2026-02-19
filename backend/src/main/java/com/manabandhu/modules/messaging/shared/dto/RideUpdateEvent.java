package com.manabandhu.modules.messaging.shared.dto;

import com.manabandhu.modules.travel.rides.components.dto.RidePostResponse;
import java.util.UUID;

public class RideUpdateEvent extends WebSocketMessage {
    private String action; // CREATED, UPDATED, STATUS_CHANGED, DELETED, REQUESTED, BOOKED
    private RidePostResponse ride;
    private UUID rideId;

    public RideUpdateEvent() {
        super("RIDE_UPDATE");
    }

    public RideUpdateEvent(String action, RidePostResponse ride) {
        super("RIDE_UPDATE");
        this.action = action;
        this.ride = ride;
        this.rideId = ride != null ? ride.getId() : null;
    }

    public RideUpdateEvent(String action, UUID rideId) {
        super("RIDE_UPDATE");
        this.action = action;
        this.rideId = rideId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public RidePostResponse getRide() {
        return ride;
    }

    public void setRide(RidePostResponse ride) {
        this.ride = ride;
    }

    public UUID getRideId() {
        return rideId;
    }

    public void setRideId(UUID rideId) {
        this.rideId = rideId;
    }
}

