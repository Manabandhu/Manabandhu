package com.manabandhu.dto.expense;

import com.manabandhu.model.expense.Expense.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExpenseRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    @NotNull(message = "Category is required")
    private ExpenseCategory category;
    
    @NotNull(message = "Expense date is required")
    private LocalDateTime expenseDate;
}

