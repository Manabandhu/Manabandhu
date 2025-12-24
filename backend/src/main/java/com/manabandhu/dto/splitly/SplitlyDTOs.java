package com.manabandhu.dto.splitly;

import lombok.Data;
import java.util.List;

@Data
public class CreateGroupRequest {
    private String name;
    private String description;
    private List<String> memberEmails;
}

@Data
public class CreateExpenseRequest {
    private String description;
    private Double amount;
    private String splitType = "EQUAL";
    private List<ExpenseSplitRequest> splits;
}

@Data
public class ExpenseSplitRequest {
    private String userEmail;
    private Double amount;
}

@Data
public class SplitGroupDTO {
    private Long id;
    private String name;
    private String description;
    private String createdBy;
    private List<String> members;
    private Double totalExpenses;
    private Double userBalance;
    private String createdAt;
}

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

@Data
public class ExpenseSplitDTO {
    private String user;
    private Double amount;
    private Boolean isPaid;
}

@Data
public class UserBalanceDTO {
    private String user;
    private Double balance;
    private String status; // "owes" or "owed"
}