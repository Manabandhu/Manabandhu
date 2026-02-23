package com.manabandhu.modules.finance.splitly.components.repository;

import com.manabandhu.shared.utils.User;
import com.manabandhu.modules.finance.splitly.components.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    Optional<ExpenseSplit> findByExpenseIdAndUser(Long expenseId, User user);
    
    @Query("SELECT es FROM ExpenseSplit es WHERE es.expense.id = :expenseId")
    List<ExpenseSplit> findByExpenseId(@Param("expenseId") Long expenseId);
}