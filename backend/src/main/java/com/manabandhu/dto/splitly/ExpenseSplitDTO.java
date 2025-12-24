package com.manabandhu.dto.splitly;

import lombok.Data;

@Data
public class ExpenseSplitDTO {
    private String user;
    private Double amount;
    private Boolean isPaid;
}