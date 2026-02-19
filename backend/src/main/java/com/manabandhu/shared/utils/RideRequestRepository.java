package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rides.components.model.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, UUID> {
    
    List<RideRequest> findByRidePostId(UUID ridePostId);
    
    List<RideRequest> findByRidePostIdAndStatus(UUID ridePostId, RideRequest.RequestStatus status);
    
    Optional<RideRequest> findByRidePostIdAndRequestedByUserId(UUID ridePostId, String requestedByUserId);
    
    long countByRidePostId(UUID ridePostId);
    
    long countByRidePostIdAndStatus(UUID ridePostId, RideRequest.RequestStatus status);
    
    List<RideRequest> findByRequestedByUserId(String userId);
}


