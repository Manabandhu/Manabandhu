package com.manabandhu.model.immigration;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "immigration_news_activity")
@Data
@EqualsAndHashCode(of = "id")
public class ImmigrationNewsActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "article_id", nullable = false)
    private UUID articleId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    public enum ActivityType {
        BREAKING_NEWS,
        POLICY_CHANGE,
        IMPORTANT_UPDATE
    }
}