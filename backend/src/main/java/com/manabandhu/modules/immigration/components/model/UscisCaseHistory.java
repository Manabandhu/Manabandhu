package com.manabandhu.modules.immigration.components.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "uscis_case_history")
@Data
@EqualsAndHashCode(of = "id")
public class UscisCaseHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "uscis_case_id", nullable = false)
    private UUID uscisCaseId;
    
    @Column(name = "status_title", nullable = false, length = 500)
    private String statusTitle;
    
    @Column(name = "status_description", columnDefinition = "TEXT")
    private String statusDescription;
    
    @Column(name = "status_date", nullable = false)
    private LocalDate statusDate;
    
    @Column(name = "raw_response_snapshot", columnDefinition = "TEXT")
    private String rawResponseSnapshot;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}