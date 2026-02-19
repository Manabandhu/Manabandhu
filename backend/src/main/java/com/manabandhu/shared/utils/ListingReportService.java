package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.dto.ListingReportRequest;
import com.manabandhu.core.exception.ResourceNotFoundException;
import com.manabandhu.core.exception.UnauthorizedException;
import com.manabandhu.core.exception.ValidationException;
import com.manabandhu.modules.travel.rooms.components.model.ListingReport;
import com.manabandhu.repository.ListingReportRepository;
import com.manabandhu.repository.RoomListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ListingReportService {
    private final ListingReportRepository reportRepository;
    private final RoomListingRepository listingRepository;

    public ListingReport createReport(String userId, UUID listingId, ListingReportRequest request) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }
        if (listingId == null) {
            throw new ValidationException("Listing ID is required");
        }
        if (request == null || request.getReason() == null) {
            throw new ValidationException("Report reason is required");
        }

        // Verify listing exists
        listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        // Check if user already reported this listing
        ListingReport existing = reportRepository.findByListingIdAndReporterUserId(listingId, userId)
                .orElse(null);
        
        if (existing != null) {
            // Update existing report
            existing.setReason(request.getReason());
            existing.setDescription(request.getDescription());
            existing.setStatus(ListingReport.ReportStatus.PENDING);
            return reportRepository.save(existing);
        }

        ListingReport report = new ListingReport();
        report.setListingId(listingId);
        report.setReporterUserId(userId);
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setStatus(ListingReport.ReportStatus.PENDING);

        report = reportRepository.save(report);
        log.info("Listing {} reported by user {}: {}", listingId, userId, request.getReason());
        return report;
    }

    public Page<ListingReport> getReportsByListing(UUID listingId, Pageable pageable) {
        return reportRepository.findByListingIdOrderByCreatedAtDesc(listingId, pageable);
    }

    public Page<ListingReport> getPendingReports(Pageable pageable) {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ListingReport.ReportStatus.PENDING, pageable);
    }

    public ListingReport updateReportStatus(UUID reportId, ListingReport.ReportStatus status, 
                                           String reviewedBy, String reviewNotes) {
        ListingReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        report.setStatus(status);
        report.setReviewedBy(reviewedBy);
        report.setReviewedAt(LocalDateTime.now());
        report.setReviewNotes(reviewNotes);

        report = reportRepository.save(report);
        log.info("Report {} status updated to {} by {}", reportId, status, reviewedBy);
        return report;
    }

    public long getReportCount(UUID listingId) {
        return reportRepository.countByListingId(listingId);
    }
}

