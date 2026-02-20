package com.manabandhu.shared.utils;

import com.manabandhu.model.User;
import com.manabandhu.modules.messaging.notification.components.model.PushToken;
import com.manabandhu.repository.PushTokenRepository;
import com.manabandhu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PushNotificationService {

    private final PushTokenRepository pushTokenRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${expo.push.url:https://exp.host/--/api/v2/push/send}")
    private String expoPushUrl;

    /**
     * Register or update a push token for the current user
     */
    public PushToken registerPushToken(String token, PushToken.Platform platform, String deviceId) {
        User currentUser = getCurrentUser();
        
        // Check if token already exists for this user
        Optional<PushToken> existing = pushTokenRepository.findByTokenAndUser(token, currentUser);
        
        if (existing.isPresent()) {
            PushToken pushToken = existing.get();
            pushToken.setPlatform(platform);
            pushToken.setDeviceId(deviceId);
            pushToken.setIsActive(true);
            return pushTokenRepository.save(pushToken);
        }
        
        // Create new token
        PushToken pushToken = new PushToken();
        pushToken.setUser(currentUser);
        pushToken.setToken(token);
        pushToken.setPlatform(platform);
        pushToken.setDeviceId(deviceId);
        pushToken.setIsActive(true);
        
        return pushTokenRepository.save(pushToken);
    }

    /**
     * Unregister a push token
     */
    public void unregisterPushToken(String token) {
        User currentUser = getCurrentUser();
        pushTokenRepository.findByTokenAndUser(token, currentUser)
            .ifPresent(pushToken -> {
                pushToken.setIsActive(false);
                pushTokenRepository.save(pushToken);
            });
    }

    /**
     * Send push notification to a specific user
     */
    public void sendPushNotificationToUser(String userId, String title, String body, Map<String, Object> data) {
        User user = userRepository.findByAuthUserId(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<PushToken> tokens = pushTokenRepository.findByUserAndIsActiveTrue(user);
        if (tokens.isEmpty()) {
            log.warn("No active push tokens found for user: {}", userId);
            return;
        }

        List<String> tokenStrings = tokens.stream()
            .map(PushToken::getToken)
            .toList();

        sendPushNotifications(tokenStrings, title, body, data);
    }

    /**
     * Send push notification to multiple users
     */
    public void sendPushNotificationsToUsers(List<String> userIds, String title, String body, Map<String, Object> data) {
        List<User> users = userIds.stream()
            .map(userId -> userRepository.findByAuthUserId(userId))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();

        List<String> allTokens = new ArrayList<>();
        for (User user : users) {
            List<PushToken> tokens = pushTokenRepository.findByUserAndIsActiveTrue(user);
            allTokens.addAll(tokens.stream().map(PushToken::getToken).toList());
        }

        if (!allTokens.isEmpty()) {
            sendPushNotifications(allTokens, title, body, data);
        }
    }

    /**
     * Send push notification to all active tokens
     */
    public void sendPushNotificationToAll(String title, String body, Map<String, Object> data) {
        List<PushToken> tokens = pushTokenRepository.findByIsActiveTrue();
        if (tokens.isEmpty()) {
            log.warn("No active push tokens found");
            return;
        }

        List<String> tokenStrings = tokens.stream()
            .map(PushToken::getToken)
            .toList();

        sendPushNotifications(tokenStrings, title, body, data);
    }

    /**
     * Send push notifications via Expo Push Notification Service
     */
    private void sendPushNotifications(List<String> tokens, String title, String body, Map<String, Object> data) {
        if (tokens.isEmpty()) {
            return;
        }

        try {
            List<Map<String, Object>> messages = tokens.stream()
                .map(token -> {
                    Map<String, Object> message = new HashMap<>();
                    message.put("to", token);
                    message.put("sound", "default");
                    message.put("title", title);
                    message.put("body", body);
                    message.put("data", data != null ? data : new HashMap<>());
                    message.put("priority", "high");
                    message.put("channelId", "default");
                    return message;
                })
                .toList();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);

            ResponseEntity<?> response = restTemplate.exchange(
                expoPushUrl, 
                HttpMethod.POST, 
                request, 
                Object.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully sent push notifications to {} tokens", tokens.size());
            } else {
                log.error("Failed to send push notifications. Status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error sending push notifications", e);
            throw new RuntimeException("Failed to send push notifications", e);
        }
    }

    /**
     * Get all push tokens for current user
     */
    public List<PushToken> getUserPushTokens() {
        User currentUser = getCurrentUser();
        return pushTokenRepository.findByUser(currentUser);
    }

    private User getCurrentUser() {
        String authUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByAuthUserId(authUserId)
            .orElseThrow(() -> new RuntimeException("User not found with authUserId: " + authUserId));
    }
}

