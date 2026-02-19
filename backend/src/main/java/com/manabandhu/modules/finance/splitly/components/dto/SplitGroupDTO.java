package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;
import java.util.List;

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