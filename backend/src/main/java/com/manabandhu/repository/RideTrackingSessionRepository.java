package com.manabandhu.repository;

import com.manabandhu.modules.travel.rides.components.model.RideTrackingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RideTrackingSessionRepository extends JpaRepository<RideTrackingSession, UUID> {
    Optional<RideTrackingSession> findByRidePostIdAndStatus(UUID ridePostId, RideTrackingSession.Status status);
}
