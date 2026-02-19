package com.manabandhu.modules.immigration.components.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AddCaseRequest {
    
    @NotBlank(message = "Receipt number is required")
    @Pattern(regexp = "^[A-Z]{3}\\d{10}$", message = "Invalid receipt number format")
    private String receiptNumber;
}