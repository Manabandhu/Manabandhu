package com.manabandhu.repository.qa;

import com.manabandhu.model.qa.ReportedContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportedContentRepository extends JpaRepository<ReportedContent, UUID> {

    List<ReportedContent> findByStatusOrderByCreatedAtDesc(ReportedContent.ReportStatus status);

    @Query("SELECT COUNT(r) FROM ReportedContent r WHERE r.contentType = :contentType AND r.contentId = :contentId AND r.status = 'PENDING'")
    Long countPendingReportsByContent(
        @Param("contentType") ReportedContent.ContentType contentType,
        @Param("contentId") UUID contentId
    );

    boolean existsByContentTypeAndContentIdAndReportedByUserId(
        ReportedContent.ContentType contentType,
        UUID contentId,
        String reportedByUserId
    );
}