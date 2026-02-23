package com.manabandhu.repository;

import com.manabandhu.modules.immigration.components.model.UscisCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UscisCaseRepository extends JpaRepository<UscisCase, UUID> {
    
    List<UscisCase> findByUserIdAndIsActiveTrue(String userId);
    
    Optional<UscisCase> findByUserIdAndReceiptNumber(String userId, String receiptNumber);
    
    Optional<UscisCase> findByIdAndUserId(UUID id, String userId);
    
    @Query("SELECT u FROM UscisCase u WHERE u.isActive = true")
    List<UscisCase> findAllActiveCases();
    
    boolean existsByUserIdAndReceiptNumber(String userId, String receiptNumber);
}