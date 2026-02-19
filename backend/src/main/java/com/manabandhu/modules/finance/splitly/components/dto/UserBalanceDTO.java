package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;

@Data
public class UserBalanceDTO {
    private String user;
    private Double balance;
    private String status; // "owes" or "owed"
}