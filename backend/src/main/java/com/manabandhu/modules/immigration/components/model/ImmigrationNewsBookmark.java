package com.manabandhu.modules.immigration.components.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "immigration_news_bookmarks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"article_id", "user_id"})
})
@Data
@EqualsAndHashCode(of = "id")
public class ImmigrationNewsBookmark {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "article_id", nullable = false)
    private UUID articleId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}