package com.manabandhu.repository;

import com.manabandhu.model.room.PriceAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, UUID> {
    Page<PriceAlert> findByUserIdAndActiveTrueOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    List<PriceAlert> findByActiveTrue();
    
    @Query("SELECT COUNT(a) FROM PriceAlert a WHERE a.userId = :userId AND a.active = true")
    long countActiveByUserId(@Param("userId") String userId);
}

