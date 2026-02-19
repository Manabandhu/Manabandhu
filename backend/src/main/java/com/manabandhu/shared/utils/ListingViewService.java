package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.model.ListingView;
import com.manabandhu.repository.ListingViewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ListingViewService {
    private final ListingViewRepository viewRepository;

    public void recordView(UUID listingId, String userId, String ipAddress, String userAgent) {
        try {
            ListingView view = new ListingView();
            view.setListingId(listingId);
            view.setUserId(userId);
            view.setIpAddress(ipAddress);
            view.setUserAgent(userAgent);
            viewRepository.save(view);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException e) {
            // Table doesn't exist yet - migration hasn't run
            log.debug("Listing views table not available yet (migration pending): {}", e.getMessage());
            // Don't throw exception - view tracking is non-critical
        } catch (Exception e) {
            log.warn("Failed to record view for listing {}: {}", listingId, e.getMessage());
            // Don't throw exception - view tracking is non-critical
        }
    }

    public long getViewCount(UUID listingId) {
        try {
            return viewRepository.countByListingId(listingId);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException e) {
            log.debug("Listing views table not available yet (migration pending)");
            return 0;
        } catch (Exception e) {
            log.warn("Failed to get view count: {}", e.getMessage());
            return 0;
        }
    }

    public long getViewCountSince(UUID listingId, LocalDateTime since) {
        try {
            return viewRepository.countByListingIdAndViewedAtAfter(listingId, since);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException e) {
            log.debug("Listing views table not available yet (migration pending)");
            return 0;
        } catch (Exception e) {
            log.warn("Failed to get view count since: {}", e.getMessage());
            return 0;
        }
    }

    public long getUniqueViewerCount(UUID listingId) {
        try {
            return viewRepository.countDistinctUsersByListingId(listingId);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException e) {
            log.debug("Listing views table not available yet (migration pending)");
            return 0;
        } catch (Exception e) {
            log.warn("Failed to get unique viewer count: {}", e.getMessage());
            return 0;
        }
    }
}

