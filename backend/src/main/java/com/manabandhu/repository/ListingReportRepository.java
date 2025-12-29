package com.manabandhu.repository;

import com.manabandhu.model.room.ListingReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingReportRepository extends JpaRepository<ListingReport, UUID> {
    Page<ListingReport> findByStatusOrderByCreatedAtDesc(ListingReport.ReportStatus status, Pageable pageable);
    
    Page<ListingReport> findByListingIdOrderByCreatedAtDesc(UUID listingId, Pageable pageable);
    
    Optional<ListingReport> findByListingIdAndReporterUserId(UUID listingId, String reporterUserId);
    
    long countByListingId(UUID listingId);
    
    long countByStatus(ListingReport.ReportStatus status);
}

