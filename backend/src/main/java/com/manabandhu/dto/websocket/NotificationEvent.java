package com.manabandhu.dto.websocket;

import java.util.Map;

public class NotificationEvent extends WebSocketMessage {
    private String notificationType;
    private String title;
    private String body;
    private Map<String, Object> data;
    private String userId;

    public NotificationEvent() {
        super("NOTIFICATION");
    }

    public NotificationEvent(String notificationType, String title, String body, Map<String, Object> data, String userId) {
        super("NOTIFICATION");
        this.notificationType = notificationType;
        this.title = title;
        this.body = body;
        this.data = data;
        this.userId = userId;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}

