package com.manabandhu.repository.splitly;

import com.manabandhu.model.User;
import com.manabandhu.model.splitly.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    Optional<ExpenseSplit> findByExpenseIdAndUser(Long expenseId, User user);
}