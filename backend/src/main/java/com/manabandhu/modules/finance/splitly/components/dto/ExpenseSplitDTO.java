package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;

@Data
public class ExpenseSplitDTO {
    private String user;
    private Double amount;
    private Boolean isPaid;
}