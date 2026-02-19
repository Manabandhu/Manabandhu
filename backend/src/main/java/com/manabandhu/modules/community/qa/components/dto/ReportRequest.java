package com.manabandhu.modules.community.qa.components.dto;

import com.manabandhu.modules.community.qa.components.model.ReportedContent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReportRequest {
    
    @NotNull(message = "Content type is required")
    private ReportedContent.ContentType contentType;
    
    @NotNull(message = "Content ID is required")
    private UUID contentId;
    
    @NotNull(message = "Report reason is required")
    private ReportedContent.ReportReason reason;
}