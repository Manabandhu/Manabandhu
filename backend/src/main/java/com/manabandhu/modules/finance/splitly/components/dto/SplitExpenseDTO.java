package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;
import java.util.List;

@Data
public class SplitExpenseDTO {
    private Long id;
    private String description;
    private Double amount;
    private String paidBy;
    private String splitType;
    private String expenseDate;
    private String createdAt;
    private List<ExpenseSplitDTO> splits;
}