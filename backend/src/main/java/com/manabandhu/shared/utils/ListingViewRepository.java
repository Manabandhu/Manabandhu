package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.model.ListingView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface ListingViewRepository extends JpaRepository<ListingView, UUID> {
    @Query("SELECT COUNT(v) FROM ListingView v WHERE v.listingId = :listingId")
    long countByListingId(@Param("listingId") UUID listingId);
    
    @Query("SELECT COUNT(v) FROM ListingView v WHERE v.listingId = :listingId AND v.viewedAt >= :since")
    long countByListingIdAndViewedAtAfter(@Param("listingId") UUID listingId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(DISTINCT v.userId) FROM ListingView v WHERE v.listingId = :listingId AND v.userId IS NOT NULL")
    long countDistinctUsersByListingId(@Param("listingId") UUID listingId);
}

