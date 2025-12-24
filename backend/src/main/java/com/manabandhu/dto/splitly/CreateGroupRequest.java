package com.manabandhu.dto.splitly;

import lombok.Data;
import java.util.List;

@Data
public class CreateGroupRequest {
    private String name;
    private String description;
    private List<String> memberEmails;
}