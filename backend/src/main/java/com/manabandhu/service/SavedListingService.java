package com.manabandhu.service;

import com.manabandhu.exception.ResourceNotFoundException;
import com.manabandhu.exception.UnauthorizedException;
import com.manabandhu.exception.ValidationException;
import com.manabandhu.model.room.RoomListing;
import com.manabandhu.model.room.SavedListing;
import com.manabandhu.repository.RoomListingRepository;
import com.manabandhu.repository.SavedListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class SavedListingService {
    private final SavedListingRepository savedListingRepository;
    private final RoomListingRepository roomListingRepository;

    public SavedListing saveListing(String userId, UUID listingId, String notes) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }
        if (listingId == null) {
            throw new ValidationException("Listing ID is required");
        }

        // Verify listing exists and is not deleted
        RoomListing listing = roomListingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        
        if (listing.getStatus() == RoomListing.Status.DELETED) {
            throw new ResourceNotFoundException("Listing not found");
        }

        // Check if already saved
        SavedListing existing = savedListingRepository.findByUserIdAndListingId(userId, listingId)
                .orElse(null);
        
        if (existing != null) {
            if (notes != null) {
                existing.setNotes(notes);
                return savedListingRepository.save(existing);
            }
            return existing;
        }

        SavedListing saved = new SavedListing();
        saved.setUserId(userId);
        saved.setListingId(listingId);
        saved.setNotes(notes);
        
        saved = savedListingRepository.save(saved);
        log.info("Listing {} saved by user {}", listingId, userId);
        return saved;
    }

    public void unsaveListing(String userId, UUID listingId) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }
        if (listingId == null) {
            throw new ValidationException("Listing ID is required");
        }

        savedListingRepository.deleteByUserIdAndListingId(userId, listingId);
        log.info("Listing {} unsaved by user {}", listingId, userId);
    }

    public boolean isSaved(String userId, UUID listingId) {
        if (!StringUtils.hasText(userId) || listingId == null) {
            return false;
        }
        try {
            return savedListingRepository.existsByUserIdAndListingId(userId, listingId);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException e) {
            // Table doesn't exist yet - migration hasn't run
            log.debug("Saved listings table not available yet (migration pending): {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.warn("Failed to check if listing is saved: {}", e.getMessage());
            return false;
        }
    }

    public Page<SavedListing> getSavedListings(String userId, Pageable pageable) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }
        return savedListingRepository.findByUserIdOrderBySavedAtDesc(userId, pageable);
    }

    public long getSaveCount(UUID listingId) {
        return savedListingRepository.countByListingId(listingId);
    }
}

