package com.manabandhu.shared.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manabandhu.modules.messaging.notification.components.model.NotificationEvent;
import com.manabandhu.repository.NotificationEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationEventService {
    private final NotificationEventRepository notificationEventRepository;
    private final PushNotificationService pushNotificationService;
    private final WebSocketService webSocketService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public NotificationEvent createEvent(String userId, NotificationEvent.NotificationType type, Map<String, Object> payload) {
        NotificationEvent event = new NotificationEvent();
        event.setUserId(userId);
        event.setType(type);
        event.setPayload(serializePayload(payload));
        event = notificationEventRepository.save(event);

        // Prepare notification data
        String title = getNotificationTitle(type);
        String body = getNotificationBody(type, payload);
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", type.toString());
        notificationData.put("eventId", event.getId().toString());
        if (payload != null) {
            notificationData.putAll(payload);
        }

        // Send push notification
        try {
            pushNotificationService.sendPushNotificationToUser(userId, title, body, notificationData);
        } catch (Exception e) {
            log.error("Failed to send push notification for event: {}", event.getId(), e);
            // Don't fail the event creation if push notification fails
        }

        // Send WebSocket notification
        try {
            com.manabandhu.modules.messaging.shared.dto.NotificationEvent wsEvent =
                new com.manabandhu.modules.messaging.shared.dto.NotificationEvent(
                    type.toString(), 
                    title, 
                    body, 
                    notificationData, 
                    userId
                );
            webSocketService.sendNotification(userId, wsEvent);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for event: {}", event.getId(), e);
            // Don't fail the event creation if WebSocket notification fails
        }

        return event;
    }

    private String serializePayload(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to serialize notification payload", e);
        }
    }

    private String getNotificationTitle(NotificationEvent.NotificationType type) {
        return switch (type) {
            case RIDE_REQUESTED -> "New Ride Request";
            case USCIS_STATUS_CHANGE -> "USCIS Status Update";
            case LISTING_HIDDEN_DUE_TO_INACTIVITY -> "Listing Hidden";
            case PRICE_ALERT_MATCHED -> "Price Alert Matched";
        };
    }

    private String getNotificationBody(NotificationEvent.NotificationType type, Map<String, Object> payload) {
        return switch (type) {
            case RIDE_REQUESTED -> {
                String requestedBy = payload != null && payload.containsKey("requestedBy") 
                    ? payload.get("requestedBy").toString() 
                    : "Someone";
                yield requestedBy + " requested to join your ride";
            }
            case USCIS_STATUS_CHANGE -> {
                String status = payload != null && payload.containsKey("status") 
                    ? payload.get("status").toString() 
                    : "updated";
                yield "Your USCIS case status has changed to: " + status;
            }
            case LISTING_HIDDEN_DUE_TO_INACTIVITY -> 
                "Your listing has been hidden due to inactivity. Update it to make it visible again.";
            case PRICE_ALERT_MATCHED -> {
                String matchesCount = payload != null && payload.containsKey("matchesCount") 
                    ? payload.get("matchesCount").toString() 
                    : "new";
                yield "Found " + matchesCount + " listing(s) matching your price alert criteria!";
            }
        };
    }
}
