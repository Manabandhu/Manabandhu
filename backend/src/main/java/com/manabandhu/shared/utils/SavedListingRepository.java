package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.model.SavedListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedListingRepository extends JpaRepository<SavedListing, UUID> {
    Optional<SavedListing> findByUserIdAndListingId(String userId, UUID listingId);
    
    Page<SavedListing> findByUserIdOrderBySavedAtDesc(String userId, Pageable pageable);
    
    boolean existsByUserIdAndListingId(String userId, UUID listingId);
    
    void deleteByUserIdAndListingId(String userId, UUID listingId);
    
    long countByListingId(UUID listingId);
}

