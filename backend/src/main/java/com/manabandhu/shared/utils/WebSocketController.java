package com.manabandhu.shared.utils;

import com.manabandhu.dto.SendMessageRequest;
import com.manabandhu.modules.messaging.chat.components.model.Message;
import com.manabandhu.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final ChatService chatService;

    /**
     * Handle incoming chat messages via WebSocket
     * Client sends to: /app/chat/message
     * Server broadcasts to: /topic/chat/{chatId}
     */
    @MessageMapping("/chat/message")
    public void handleChatMessage(
            @Payload SendMessageRequest request,
            SimpMessageHeaderAccessor headerAccessor) {
        
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) {
            log.warn("Unauthenticated WebSocket message attempt");
            return;
        }

        String senderId = auth.getName();
        Long chatId = request.getChatId();
        String content = request.getContent();
        Message.MessageType type = request.getType() != null ? request.getType() : Message.MessageType.TEXT;

        try {
            // Save message to database
            // The message will be broadcast by ChatService after saving
            chatService.sendMessage(chatId, senderId, content, type);
            log.info("Chat message received via WebSocket from user {} in chat {}", senderId, chatId);
        } catch (Exception e) {
            log.error("Error handling chat message via WebSocket", e);
        }
    }
}

