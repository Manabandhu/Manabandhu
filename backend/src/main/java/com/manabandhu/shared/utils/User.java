package com.manabandhu.shared.utils;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String firebaseUid;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phoneNumber;

    private String country;
    
    private String city;
    
    private String role;

    private String photoUrl;

    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.EMAIL;

    private String proxyName;

    @Column(nullable = false)
    private Boolean isActive = true;

    @ElementCollection
    @CollectionTable(name = "user_purposes", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "purpose")
    private List<String> purposes;

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    private List<String> interests;

    @ElementCollection
    @CollectionTable(name = "user_homepage_priorities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "priority")
    private List<String> homepagePriorities;

    @ElementCollection
    @CollectionTable(name = "user_enabled_priorities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "priority")
    private List<String> enabledPriorities;

    @Column(nullable = false)
    private Boolean onboardingCompleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
