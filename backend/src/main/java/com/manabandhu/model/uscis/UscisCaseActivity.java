package com.manabandhu.model.uscis;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "uscis_case_activity")
@Data
@EqualsAndHashCode(of = "id")
public class UscisCaseActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "uscis_case_id", nullable = false)
    private UUID uscisCaseId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ActivityType type;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    public enum ActivityType {
        CASE_ADDED,
        STATUS_CHANGED,
        CASE_REMOVED,
        AUTO_REFRESH,
        MANUAL_REFRESH
    }
}