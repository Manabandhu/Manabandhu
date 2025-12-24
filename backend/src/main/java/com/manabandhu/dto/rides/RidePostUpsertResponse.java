package com.manabandhu.dto.rides;

public class RidePostUpsertResponse {
    private RidePostResponse post;
    private UpsertAction action;

    public enum UpsertAction {
        CREATED,
        UPDATED_EXISTING,
        REBOOKED_FROM_BOOKED
    }

    public RidePostUpsertResponse(RidePostResponse post, UpsertAction action) {
        this.post = post;
        this.action = action;
    }

    public RidePostResponse getPost() {
        return post;
    }

    public UpsertAction getAction() {
        return action;
    }
}
