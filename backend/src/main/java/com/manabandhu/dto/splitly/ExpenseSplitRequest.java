package com.manabandhu.dto.splitly;

import lombok.Data;

@Data
public class ExpenseSplitRequest {
    private String userEmail;
    private Double amount;
}