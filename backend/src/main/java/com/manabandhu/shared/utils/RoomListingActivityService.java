package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.model.RoomListingActivity;
import com.manabandhu.repository.RoomListingActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RoomListingActivityService {
    private final RoomListingActivityRepository activityRepository;

    @Autowired
    public RoomListingActivityService(RoomListingActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public Page<RoomListingActivity> getHomeActivities(Pageable pageable) {
        Collection<RoomListingActivity.ActivityType> types = List.of(
                RoomListingActivity.ActivityType.CREATED,
                RoomListingActivity.ActivityType.AUTO_HIDDEN,
                RoomListingActivity.ActivityType.STATUS_CHANGED,
                RoomListingActivity.ActivityType.CHAT_STARTED,
                RoomListingActivity.ActivityType.REPOSTED
        );
        return activityRepository.findByTypeInOrderByCreatedAtDesc(types, pageable);
    }

    public Page<RoomListingActivity> getActivitiesForListings(List<UUID> listingIds, Pageable pageable) {
        if (listingIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return activityRepository.findByListingIdInOrderByCreatedAtDesc(listingIds, pageable);
    }
}
