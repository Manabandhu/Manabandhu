package com.manabandhu.model.uscis;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "uscis_cases", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "receipt_number"})
})
@Data
@EqualsAndHashCode(of = "id")
public class UscisCase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "receipt_number", nullable = false, length = 13)
    private String receiptNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "form_type", nullable = false)
    private FormType formType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "service_center", nullable = false)
    private ServiceCenter serviceCenter;
    
    @Column(name = "case_status", length = 500)
    private String caseStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "case_status_code")
    private CaseStatusCode caseStatusCode;
    
    @Column(name = "status_description", columnDefinition = "TEXT")
    private String statusDescription;
    
    @Column(name = "last_status_date")
    private LocalDate lastStatusDate;
    
    @Column(name = "received_date")
    private LocalDate receivedDate;
    
    @Column(name = "last_checked_at")
    private LocalDateTime lastCheckedAt;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum FormType {
        I129, I130, I140, I485, I765, I539, I131, OTHER
    }
    
    public enum ServiceCenter {
        SRC, LIN, WAC, EAC, IOE, NBC, OTHER
    }
    
    public enum CaseStatusCode {
        RECEIVED,
        INITIAL_REVIEW,
        RFE_SENT,
        RFE_RESPONSE_RECEIVED,
        INTERVIEW_SCHEDULED,
        INTERVIEW_COMPLETED,
        DECISION_PENDING,
        APPROVED,
        DENIED,
        CARD_PRODUCED,
        CARD_MAILED,
        CASE_CLOSED,
        TRANSFERRED,
        REOPENED,
        OTHER
    }
}