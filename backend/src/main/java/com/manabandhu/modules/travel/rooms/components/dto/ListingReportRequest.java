package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.ListingReport;

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

