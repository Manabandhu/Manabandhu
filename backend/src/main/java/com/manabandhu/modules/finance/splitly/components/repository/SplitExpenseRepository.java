package com.manabandhu.modules.finance.splitly.components.repository;

import com.manabandhu.modules.finance.splitly.components.model.SplitExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SplitExpenseRepository extends JpaRepository<SplitExpense, Long> {
    Page<SplitExpense> findByGroupIdOrderByCreatedAtDesc(Long groupId, Pageable pageable);
}