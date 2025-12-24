package com.manabandhu.dto.immigration;

import lombok.Data;

@Data
public class VerifyArticleRequest {
    private Boolean isVerified;
    private String verificationNotes;
}

@Data
public class NewsFilterRequest {
    private String visaCategory;
    private String country;
    private String impactLevel;
    private String sourceType;
    private Boolean isBreaking;
    private Integer page = 0;
    private Integer size = 20;
}