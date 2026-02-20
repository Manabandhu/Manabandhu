package com.manabandhu.shared.dto;

import com.manabandhu.model.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String authUserId;
    private String name;
    private String email;
    private String phoneNumber;
    private String country;
    private String city;
    private String role;
    private String photoUrl;
    private String currency;
    private AuthProvider authProvider;
    private String proxyName;
    private Boolean isActive;
    private List<String> purposes;
    private List<String> interests;
    private List<String> homepagePriorities;
    private List<String> enabledPriorities;
    private Boolean onboardingCompleted;
}
