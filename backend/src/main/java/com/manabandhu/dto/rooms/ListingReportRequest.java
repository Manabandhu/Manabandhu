package com.manabandhu.dto.rooms;

import com.manabandhu.model.room.ListingReport;

public class ListingReportRequest {
    private ListingReport.ReportReason reason;
    private String description;

    public ListingReport.ReportReason getReason() {
        return reason;
    }

    public void setReason(ListingReport.ReportReason reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

