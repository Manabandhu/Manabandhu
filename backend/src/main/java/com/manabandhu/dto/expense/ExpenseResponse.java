package com.manabandhu.dto.expense;

import com.manabandhu.model.expense.Expense;
import com.manabandhu.model.expense.Expense.ExpenseCategory;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExpenseResponse {
    private Long id;
    private String title;
    private String description;
    private Double amount;
    private ExpenseCategory category;
    private LocalDateTime expenseDate;
    private LocalDateTime createdAt;
    private String userId;
    private String userName;

    public ExpenseResponse(Expense expense) {
        this.id = expense.getId();
        this.title = expense.getTitle();
        this.description = expense.getDescription();
        this.amount = expense.getAmount();
        this.category = expense.getCategory();
        this.expenseDate = expense.getExpenseDate();
        this.createdAt = expense.getCreatedAt();
        this.userId = expense.getUser().getFirebaseUid();
        this.userName = expense.getUser().getName();
    }
}

