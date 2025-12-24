package com.manabandhu.repository;

import com.manabandhu.model.uscis.UscisCaseActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UscisCaseActivityRepository extends JpaRepository<UscisCaseActivity, UUID> {
    
    List<UscisCaseActivity> findByUserIdOrderByCreatedAtDesc(String userId);
}