package com.manabandhu.modules.messaging.notification.components.controller;

import com.manabandhu.modules.messaging.notification.components.dto.PushTokenRequest;
import com.manabandhu.modules.messaging.notification.components.model.PushToken;
import com.manabandhu.shared.utils.PushNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Push Notifications", description = "Push notification token management")
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    @PostMapping("/push-tokens")
    @Operation(summary = "Register a push token")
    public ResponseEntity<PushToken> registerPushToken(@Valid @RequestBody PushTokenRequest request) {
        PushToken token = pushNotificationService.registerPushToken(
            request.getToken(),
            request.getPlatform(),
            request.getDeviceId()
        );
        return ResponseEntity.ok(token);
    }

    @PutMapping("/push-tokens/{token}")
    @Operation(summary = "Update a push token")
    public ResponseEntity<PushToken> updatePushToken(
            @PathVariable String token,
            @Valid @RequestBody PushTokenRequest request) {
        PushToken updatedToken = pushNotificationService.registerPushToken(
            request.getToken(),
            request.getPlatform(),
            request.getDeviceId()
        );
        return ResponseEntity.ok(updatedToken);
    }

    @DeleteMapping("/push-tokens/{token}")
    @Operation(summary = "Unregister a push token")
    public ResponseEntity<Void> unregisterPushToken(@PathVariable String token) {
        pushNotificationService.unregisterPushToken(token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/push-tokens")
    @Operation(summary = "Get user's push tokens")
    public ResponseEntity<List<PushToken>> getUserPushTokens() {
        return ResponseEntity.ok(pushNotificationService.getUserPushTokens());
    }
}


