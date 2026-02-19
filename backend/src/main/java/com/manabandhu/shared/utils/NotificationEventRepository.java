package com.manabandhu.shared.utils;

import com.manabandhu.modules.messaging.notification.components.model.NotificationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationEventRepository extends JpaRepository<NotificationEvent, UUID> {
}
