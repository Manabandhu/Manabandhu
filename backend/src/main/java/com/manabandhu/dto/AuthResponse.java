package com.manabandhu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String idToken;
    private UserDTO user;
    private String message;
    
    public AuthResponse(String idToken, UserDTO user) {
        this.idToken = idToken;
        this.user = user;
    }
}
