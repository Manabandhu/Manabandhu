package com.manabandhu.controller;

import com.manabandhu.dto.splitly.*;
import com.manabandhu.service.SplitlyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/splitly")
@RequiredArgsConstructor
@Tag(name = "Splitly", description = "Expense splitting functionality")
public class SplitlyController {

    private final SplitlyService splitlyService;

    @PostMapping("/groups")
    @Operation(summary = "Create a new split group")
    public ResponseEntity<SplitGroupDTO> createGroup(@RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(splitlyService.createGroup(request));
    }

    @GetMapping("/groups")
    @Operation(summary = "Get user's split groups")
    public ResponseEntity<List<SplitGroupDTO>> getUserGroups() {
        return ResponseEntity.ok(splitlyService.getUserGroups());
    }

    @GetMapping("/groups/{groupId}")
    @Operation(summary = "Get group details")
    public ResponseEntity<SplitGroupDTO> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(splitlyService.getGroup(groupId));
    }

    @PostMapping("/groups/{groupId}/expenses")
    @Operation(summary = "Add expense to group")
    public ResponseEntity<SplitExpenseDTO> addExpense(
            @PathVariable Long groupId,
            @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.ok(splitlyService.addExpense(groupId, request));
    }

    @GetMapping("/groups/{groupId}/expenses")
    @Operation(summary = "Get group expenses")
    public ResponseEntity<Page<SplitExpenseDTO>> getGroupExpenses(
            @PathVariable Long groupId,
            Pageable pageable) {
        return ResponseEntity.ok(splitlyService.getGroupExpenses(groupId, pageable));
    }

    @GetMapping("/groups/{groupId}/balances")
    @Operation(summary = "Get group balances")
    public ResponseEntity<List<UserBalanceDTO>> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(splitlyService.getGroupBalances(groupId));
    }

    @PostMapping("/expenses/{expenseId}/settle")
    @Operation(summary = "Mark expense as settled")
    public ResponseEntity<Void> settleExpense(@PathVariable Long expenseId) {
        splitlyService.settleExpense(expenseId);
        return ResponseEntity.ok().build();
    }
}