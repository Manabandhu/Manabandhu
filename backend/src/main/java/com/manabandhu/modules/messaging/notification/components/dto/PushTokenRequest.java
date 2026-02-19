package com.manabandhu.modules.messaging.notification.components.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.manabandhu.modules.messaging.notification.components.model.PushToken.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PushTokenRequest {
    @NotBlank(message = "Token is required")
    private String token;

    @NotNull(message = "Platform is required")
    private Platform platform;

    private String deviceId;

    // Custom setter to handle case-insensitive platform conversion from frontend
    @JsonSetter("platform")
    public void setPlatformFromString(String platformStr) {
        if (platformStr != null) {
            try {
                // Convert lowercase to uppercase enum value (ios -> IOS, android -> ANDROID, web -> WEB)
                this.platform = Platform.valueOf(platformStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid platform: " + platformStr + ". Must be one of: ios, android, web");
            }
        }
    }
}
