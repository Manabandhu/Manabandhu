package com.manabandhu.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingRequest {
    private String displayName;
    private String country;
    private String city;
    private String role;
    private List<String> purposes;
    private List<String> interests;
    private List<String> homepagePriorities;
    private List<String> enabledPriorities;
    private Boolean onboardingCompleted;
}
