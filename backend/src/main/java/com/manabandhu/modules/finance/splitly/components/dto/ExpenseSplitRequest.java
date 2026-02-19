package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;

@Data
public class ExpenseSplitRequest {
    private String userEmail;
    private Double amount;
}