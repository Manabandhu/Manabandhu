package com.manabandhu.repository;

import com.manabandhu.model.ride.RidePost;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RidePostRepository extends JpaRepository<RidePost, UUID>, JpaSpecificationExecutor<RidePost> {
    Page<RidePost> findByOwnerUserIdOrderByCreatedAtDesc(String ownerUserId, Pageable pageable);

    List<RidePost> findByOwnerUserIdAndStatusIn(String ownerUserId, List<RidePost.Status> status);

    List<RidePost> findByStatusInAndExpiresAtBefore(List<RidePost.Status> status, LocalDateTime cutoff);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from RidePost r where r.id = :id")
    Optional<RidePost> findByIdForUpdate(@Param("id") UUID id);
}
