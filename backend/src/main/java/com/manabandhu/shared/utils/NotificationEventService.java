package com.manabandhu.shared.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manabandhu.modules.messaging.notification.components.model.NotificationEvent;
import com.manabandhu.repository.NotificationEventRepository;
import static com.manabandhu.shared.constants.NotificationConstants.*;
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
        notificationData.put(DATA_TYPE_KEY, type.toString());
        notificationData.put(DATA_EVENT_ID_KEY, event.getId().toString());
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
            case RIDE_REQUESTED -> TITLE_RIDE_REQUESTED;
            case USCIS_STATUS_CHANGE -> TITLE_USCIS_STATUS_CHANGE;
            case LISTING_HIDDEN_DUE_TO_INACTIVITY -> TITLE_LISTING_HIDDEN;
            case PRICE_ALERT_MATCHED -> TITLE_PRICE_ALERT_MATCHED;
        };
    }

    private String getNotificationBody(NotificationEvent.NotificationType type, Map<String, Object> payload) {
        return switch (type) {
            case RIDE_REQUESTED -> {
                String requestedBy = PayloadValueUtils.getStringOrDefault(
                        payload,
                        PAYLOAD_REQUESTED_BY,
                        DEFAULT_REQUESTED_BY
                );
                yield requestedBy + RIDE_REQUESTED_BODY_SUFFIX;
            }
            case USCIS_STATUS_CHANGE -> {
                String status = PayloadValueUtils.getStringOrDefault(payload, PAYLOAD_STATUS, DEFAULT_STATUS);
                yield USCIS_STATUS_CHANGE_BODY_PREFIX + status;
            }
            case LISTING_HIDDEN_DUE_TO_INACTIVITY -> LISTING_HIDDEN_BODY;
            case PRICE_ALERT_MATCHED -> {
                String matchesCount = PayloadValueUtils.getStringOrDefault(
                        payload,
                        PAYLOAD_MATCHES_COUNT,
                        DEFAULT_MATCHES_COUNT
                );
                yield PRICE_ALERT_BODY_PREFIX + matchesCount + PRICE_ALERT_BODY_SUFFIX;
            }
        };
    }
}
