package com.manabandhu.dto.splitly;

import lombok.Data;

@Data
public class UserBalanceDTO {
    private String user;
    private Double balance;
    private String status; // "owes" or "owed"
}