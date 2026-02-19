package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.model.RoomListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RoomListingRepository extends JpaRepository<RoomListing, UUID>, JpaSpecificationExecutor<RoomListing> {
    Page<RoomListing> findByOwnerUserIdOrderByCreatedAtDesc(String ownerUserId, Pageable pageable);

    List<RoomListing> findByStatusInAndLastActivityAtBefore(List<RoomListing.Status> statuses, LocalDateTime cutoff);
}
