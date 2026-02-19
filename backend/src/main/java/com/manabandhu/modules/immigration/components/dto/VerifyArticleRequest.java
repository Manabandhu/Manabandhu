package com.manabandhu.modules.immigration.components.dto;

import lombok.Data;

@Data
public class VerifyArticleRequest {
    private Boolean isVerified;
    private String verificationNotes;
}