package com.manabandhu.dto.notification;

import com.manabandhu.model.notification.PushToken.Platform;
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
}

