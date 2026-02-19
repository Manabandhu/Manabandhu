package com.manabandhu.modules.finance.expenses.components.controller;

import com.manabandhu.modules.finance.expenses.components.dto.ExpenseRequest;
import com.manabandhu.modules.finance.expenses.components.dto.ExpenseResponse;
import com.manabandhu.modules.finance.expenses.components.model.Expense.ExpenseCategory;
import com.manabandhu.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Personal expense management")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @Operation(summary = "Create a new expense")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(expenseService.createExpense(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an expense")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID")
    public ResponseEntity<ExpenseResponse> getExpense(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpense(id));
    }

    @GetMapping
    @Operation(summary = "Get user's expenses")
    public ResponseEntity<Page<ExpenseResponse>> getUserExpenses(Pageable pageable) {
        return ResponseEntity.ok(expenseService.getUserExpenses(pageable));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get user's expenses by category")
    public ResponseEntity<Page<ExpenseResponse>> getUserExpensesByCategory(
            @PathVariable ExpenseCategory category,
            Pageable pageable) {
        return ResponseEntity.ok(expenseService.getUserExpensesByCategory(category, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search user's expenses")
    public ResponseEntity<Page<ExpenseResponse>> searchExpenses(
            @RequestParam String q,
            Pageable pageable) {
        return ResponseEntity.ok(expenseService.searchUserExpenses(q, pageable));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get user's expenses by date range")
    public ResponseEntity<Page<ExpenseResponse>> getUserExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        return ResponseEntity.ok(expenseService.getUserExpensesByDateRange(startDate, endDate, pageable));
    }
}


