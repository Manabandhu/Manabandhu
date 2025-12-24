package com.manabandhu.repository;

import com.manabandhu.model.notification.NotificationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationEventRepository extends JpaRepository<NotificationEvent, UUID> {
}
