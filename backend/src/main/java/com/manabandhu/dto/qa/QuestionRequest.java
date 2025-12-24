package com.manabandhu.dto.qa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @NotBlank(message = "Body is required")
    private String body;
    
    @NotEmpty(message = "At least one tag is required")
    @Size(max = 5, message = "Maximum 5 tags allowed")
    private List<String> tags;
}