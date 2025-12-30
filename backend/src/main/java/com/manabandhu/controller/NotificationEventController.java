package com.manabandhu.controller;

import com.manabandhu.dto.notification.NotificationEventRequest;
import com.manabandhu.service.NotificationEventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationEventController {
    private final NotificationEventService notificationEventService;

    @Autowired
    public NotificationEventController(NotificationEventService notificationEventService) {
        this.notificationEventService = notificationEventService;
    }

    @PostMapping("/events")
    public ResponseEntity<Void> createEvent(@Valid @RequestBody NotificationEventRequest request) {
        notificationEventService.createEvent(
                request.getUserId(),
                request.getType(),
                request.getPayload()
        );
        return ResponseEntity.accepted().build();
    }
}
