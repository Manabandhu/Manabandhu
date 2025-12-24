package com.manabandhu.repository;

import com.manabandhu.model.ride.RideConversationLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RideConversationLinkRepository extends JpaRepository<RideConversationLink, UUID> {
    Optional<RideConversationLink> findByRidePostIdAndOwnerUserIdAndOtherUserId(UUID ridePostId, String ownerUserId, String otherUserId);

    Optional<RideConversationLink> findByChatThreadId(String chatThreadId);
}
