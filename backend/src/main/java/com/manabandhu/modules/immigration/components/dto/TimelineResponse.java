package com.manabandhu.modules.immigration.components.dto;

import com.manabandhu.modules.immigration.components.model.UscisCaseHistory;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class TimelineResponse {
    private UUID id;
    private String statusTitle;
    private String statusDescription;
    private LocalDate statusDate;
    private LocalDateTime createdAt;
    
    public static TimelineResponse from(UscisCaseHistory history) {
        TimelineResponse response = new TimelineResponse();
        response.setId(history.getId());
        response.setStatusTitle(history.getStatusTitle());
        response.setStatusDescription(history.getStatusDescription());
        response.setStatusDate(history.getStatusDate());
        response.setCreatedAt(history.getCreatedAt());
        return response;
    }
}

@Data
class CaseTimelineResponse {
    private CaseResponse caseInfo;
    private List<TimelineResponse> timeline;
}