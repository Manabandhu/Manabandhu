package com.manabandhu.dto.immigration;

import lombok.Data;

@Data
public class VerifyArticleRequest {
    private Boolean isVerified;
    private String verificationNotes;
}