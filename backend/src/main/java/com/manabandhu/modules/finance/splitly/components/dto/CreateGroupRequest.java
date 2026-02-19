package com.manabandhu.modules.finance.splitly.components.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateGroupRequest {
    private String name;
    private String description;
    private List<String> memberEmails;
}