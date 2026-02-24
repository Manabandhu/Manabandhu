package com.manabandhu.shared.utils;

import com.manabandhu.modules.finance.expenses.components.dto.ExpenseRequest;
import com.manabandhu.modules.finance.expenses.components.dto.ExpenseResponse;
import com.manabandhu.core.exception.ResourceNotFoundException;
import com.manabandhu.shared.utils.User;
import com.manabandhu.shared.constants.ExpenseMessages;
import com.manabandhu.modules.finance.expenses.components.model.Expense;
import com.manabandhu.repository.ExpenseRepository;
import com.manabandhu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseResponse createExpense(ExpenseRequest request) {
        User currentUser = getCurrentUser();
        
        Expense expense = new Expense();
        expense.setUser(currentUser);
        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        
        expense = expenseRepository.save(expense);
        return new ExpenseResponse(expense);
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        User currentUser = getCurrentUser();
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ExpenseMessages.EXPENSE_NOT_FOUND));
        
        if (!expense.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException(ExpenseMessages.UPDATE_NOT_AUTHORIZED);
        }
        
        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        
        expense = expenseRepository.save(expense);
        return new ExpenseResponse(expense);
    }

    public void deleteExpense(Long id) {
        User currentUser = getCurrentUser();
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ExpenseMessages.EXPENSE_NOT_FOUND));
        
        if (!expense.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException(ExpenseMessages.DELETE_NOT_AUTHORIZED);
        }
        
        expenseRepository.delete(expense);
    }

    public ExpenseResponse getExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(ExpenseMessages.EXPENSE_NOT_FOUND));
        return new ExpenseResponse(expense);
    }

    public Page<ExpenseResponse> getUserExpenses(Pageable pageable) {
        User currentUser = getCurrentUser();
        return expenseRepository.findByUserOrderByExpenseDateDesc(currentUser, pageable)
            .map(ExpenseResponse::new);
    }

    public Page<ExpenseResponse> getUserExpensesByCategory(
            Expense.ExpenseCategory category, 
            Pageable pageable) {
        User currentUser = getCurrentUser();
        return expenseRepository.findByUserAndCategoryOrderByExpenseDateDesc(currentUser, category, pageable)
            .map(ExpenseResponse::new);
    }

    public Page<ExpenseResponse> getUserExpensesByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        User currentUser = getCurrentUser();
        return expenseRepository.findByUserAndDateRange(currentUser, startDate, endDate, pageable)
            .map(ExpenseResponse::new);
    }

    public Page<ExpenseResponse> searchUserExpenses(String search, Pageable pageable) {
        User currentUser = getCurrentUser();
        return expenseRepository.findByUserAndSearch(currentUser, search, pageable)
            .map(ExpenseResponse::new);
    }

    private User getCurrentUser() {
        String authUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByAuthUserId(authUserId)
            .orElseThrow(() -> new RuntimeException(ExpenseMessages.USER_NOT_FOUND_PREFIX + authUserId));
    }
}
