package com.manabandhu.modules.community.qa.components.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnswerRequest {
    
    @NotBlank(message = "Answer body is required")
    private String body;
}