package com.manabandhu.shared.utils;

import com.manabandhu.modules.immigration.components.model.UscisCaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UscisCaseHistoryRepository extends JpaRepository<UscisCaseHistory, UUID> {
    
    List<UscisCaseHistory> findByUscisCaseIdOrderByStatusDateDesc(UUID uscisCaseId);
}