package com.manabandhu.repository;

import com.manabandhu.modules.travel.rooms.components.model.ConversationLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConversationLinkRepository extends JpaRepository<ConversationLink, UUID> {
    Optional<ConversationLink> findByListingIdAndOwnerUserIdAndOtherUserId(UUID listingId, String ownerUserId, String otherUserId);

    Optional<ConversationLink> findByListingIdAndOtherUserId(UUID listingId, String otherUserId);

    Optional<ConversationLink> findByChatThreadId(String chatThreadId);
}
