package com.manabandhu.modules.immigration.components.dto;

import com.manabandhu.modules.immigration.components.model.UscisCase;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CaseResponse {
    private UUID id;
    private String receiptNumber;
    private UscisCase.FormType formType;
    private UscisCase.ServiceCenter serviceCenter;
    private String caseStatus;
    private UscisCase.CaseStatusCode caseStatusCode;
    private String statusDescription;
    private LocalDate lastStatusDate;
    private LocalDate receivedDate;
    private LocalDateTime lastCheckedAt;
    private LocalDateTime createdAt;
    private Integer daysPending;
    
    public static CaseResponse from(UscisCase uscisCase) {
        CaseResponse response = new CaseResponse();
        response.setId(uscisCase.getId());
        response.setReceiptNumber(uscisCase.getReceiptNumber());
        response.setFormType(uscisCase.getFormType());
        response.setServiceCenter(uscisCase.getServiceCenter());
        response.setCaseStatus(uscisCase.getCaseStatus());
        response.setCaseStatusCode(uscisCase.getCaseStatusCode());
        response.setStatusDescription(uscisCase.getStatusDescription());
        response.setLastStatusDate(uscisCase.getLastStatusDate());
        response.setReceivedDate(uscisCase.getReceivedDate());
        response.setLastCheckedAt(uscisCase.getLastCheckedAt());
        response.setCreatedAt(uscisCase.getCreatedAt());
        
        if (uscisCase.getReceivedDate() != null) {
            response.setDaysPending((int) java.time.temporal.ChronoUnit.DAYS.between(
                uscisCase.getReceivedDate(), LocalDate.now()));
        }
        
        return response;
    }
}