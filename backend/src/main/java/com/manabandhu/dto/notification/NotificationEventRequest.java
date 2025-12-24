package com.manabandhu.dto.notification;

import com.manabandhu.model.notification.NotificationEvent;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class NotificationEventRequest {
    @NotNull
    private NotificationEvent.NotificationType type;

    @NotNull
    private String userId;

    private Map<String, Object> payload;

    public NotificationEvent.NotificationType getType() {
        return type;
    }

    public void setType(NotificationEvent.NotificationType type) {
        this.type = type;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }
}
