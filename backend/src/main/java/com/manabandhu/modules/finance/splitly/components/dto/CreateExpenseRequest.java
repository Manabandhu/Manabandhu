package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateExpenseRequest {
    private String description;
    private Double amount;
    private String splitType = "EQUAL";
    private List<ExpenseSplitRequest> splits;
}