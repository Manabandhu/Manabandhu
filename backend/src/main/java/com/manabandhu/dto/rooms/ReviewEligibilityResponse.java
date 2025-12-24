package com.manabandhu.dto.rooms;

public class ReviewEligibilityResponse {
    private boolean eligible;

    public ReviewEligibilityResponse(boolean eligible) {
        this.eligible = eligible;
    }

    public boolean isEligible() {
        return eligible;
    }
}
