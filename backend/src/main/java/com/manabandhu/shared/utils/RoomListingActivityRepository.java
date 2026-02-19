package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.model.RoomListingActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.UUID;

public interface RoomListingActivityRepository extends JpaRepository<RoomListingActivity, UUID> {
    Page<RoomListingActivity> findByTypeInOrderByCreatedAtDesc(Collection<RoomListingActivity.ActivityType> types, Pageable pageable);

    Page<RoomListingActivity> findByListingIdInOrderByCreatedAtDesc(Collection<UUID> listingIds, Pageable pageable);
}
