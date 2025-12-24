package com.manabandhu.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manabandhu.model.notification.NotificationEvent;
import com.manabandhu.repository.NotificationEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class NotificationEventService {
    private final NotificationEventRepository notificationEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public NotificationEventService(NotificationEventRepository notificationEventRepository) {
        this.notificationEventRepository = notificationEventRepository;
    }

    public NotificationEvent createEvent(String userId, NotificationEvent.NotificationType type, Map<String, Object> payload) {
        NotificationEvent event = new NotificationEvent();
        event.setUserId(userId);
        event.setType(type);
        event.setPayload(serializePayload(payload));
        return notificationEventRepository.save(event);
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
}
