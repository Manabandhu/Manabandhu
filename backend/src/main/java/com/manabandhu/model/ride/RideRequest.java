package com.manabandhu.model.ride;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ride_requests", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"ride_post_id", "requested_by_user_id"}))
@EntityListeners(AuditingEntityListener.class)
public class RideRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "ride_post_id", nullable = false)
    private UUID ridePostId;
    
    @Column(name = "requested_by_user_id", nullable = false)
    private String requestedByUserId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum RequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        CANCELLED
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getRidePostId() {
        return ridePostId;
    }
    
    public void setRidePostId(UUID ridePostId) {
        this.ridePostId = ridePostId;
    }
    
    public String getRequestedByUserId() {
        return requestedByUserId;
    }
    
    public void setRequestedByUserId(String requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }
    
    public RequestStatus getStatus() {
        return status;
    }
    
    public void setStatus(RequestStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

