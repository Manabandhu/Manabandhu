package com.manabandhu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String firebaseUid;
    private String name;
    private String email;
    private String phoneNumber;
    private String country;
    private String city;
    private String role;
    private String photoUrl;
    private Boolean isActive;
}
