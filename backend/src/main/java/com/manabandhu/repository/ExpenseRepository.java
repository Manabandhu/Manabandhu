package com.manabandhu.repository;

import com.manabandhu.model.User;
import com.manabandhu.model.expense.Expense;
import com.manabandhu.model.expense.Expense.ExpenseCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByUserOrderByExpenseDateDesc(User user, Pageable pageable);
    
    Page<Expense> findByUserAndCategoryOrderByExpenseDateDesc(User user, ExpenseCategory category, Pageable pageable);
    
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate ORDER BY e.expenseDate DESC")
    Page<Expense> findByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.expenseDate DESC")
    Page<Expense> findByUserAndSearch(
        @Param("user") User user,
        @Param("search") String search,
        Pageable pageable
    );
    
    List<Expense> findByUser(User user);
}

