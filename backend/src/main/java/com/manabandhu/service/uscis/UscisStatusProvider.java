package com.manabandhu.service.uscis;

import com.manabandhu.model.uscis.UscisCase;

public interface UscisStatusProvider {
    
    UscisStatusResult fetchCaseStatus(String receiptNumber);
    
    record UscisStatusResult(
        String status,
        String description,
        String formType,
        String serviceCenter,
        java.time.LocalDate statusDate,
        java.time.LocalDate receivedDate,
        UscisCase.CaseStatusCode statusCode,
        String rawResponse
    ) {}
}