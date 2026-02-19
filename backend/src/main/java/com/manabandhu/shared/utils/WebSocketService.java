package com.manabandhu.shared.utils;

import com.manabandhu.modules.messaging.shared.dto.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send message to a specific user
     */
    public void sendToUser(String userId, String destination, WebSocketMessage message) {
        String userDestination = "/user/" + userId + destination;
        messagingTemplate.convertAndSend(userDestination, message);
        log.debug("Sent WebSocket message to user {} at destination {}", userId, userDestination);
    }

    /**
     * Send message to multiple users
     */
    public void sendToUsers(List<String> userIds, String destination, WebSocketMessage message) {
        userIds.forEach(userId -> sendToUser(userId, destination, message));
    }

    /**
     * Broadcast message to a topic
     */
    public void broadcast(String destination, WebSocketMessage message) {
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Broadcasted WebSocket message to destination {}", destination);
    }

    /**
     * Send chat message to all participants in a chat
     */
    public void sendChatMessage(List<String> participantIds, Long chatId, WebSocketMessage message) {
        participantIds.forEach(participantId -> {
            sendToUser(participantId, "/queue/chat/messages", message);
        });
    }

    /**
     * Send notification to a user
     */
    public void sendNotification(String userId, WebSocketMessage message) {
        sendToUser(userId, "/queue/notifications", message);
    }

    /**
     * Broadcast community post update
     */
    public void broadcastCommunityUpdate(WebSocketMessage message) {
        broadcast("/topic/community/updates", message);
    }

    /**
     * Broadcast ride update
     */
    public void broadcastRideUpdate(WebSocketMessage message) {
        broadcast("/topic/rides/updates", message);
    }

    /**
     * Send ride update to specific users
     */
    public void sendRideUpdate(List<String> userIds, WebSocketMessage message) {
        sendToUsers(userIds, "/queue/rides/updates", message);
    }

    /**
     * Broadcast room update
     */
    public void broadcastRoomUpdate(WebSocketMessage message) {
        broadcast("/topic/rooms/updates", message);
    }

    /**
     * Send room update to specific users
     */
    public void sendRoomUpdate(List<String> userIds, WebSocketMessage message) {
        sendToUsers(userIds, "/queue/rooms/updates", message);
    }

    /**
     * Broadcast Q&A update
     */
    public void broadcastQaUpdate(WebSocketMessage message) {
        broadcast("/topic/qa/updates", message);
    }
}

