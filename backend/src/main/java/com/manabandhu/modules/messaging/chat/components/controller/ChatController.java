package com.manabandhu.modules.messaging.chat.components.controller;

import com.manabandhu.modules.messaging.chat.components.dto.ChatDTO;
import com.manabandhu.shared.dto.MessageDTO;
import com.manabandhu.modules.messaging.chat.components.model.Chat;
import com.manabandhu.modules.messaging.chat.components.model.Message;
import com.manabandhu.shared.utils.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatDTO>> getUserChats(Authentication authentication) {
        String userId = authentication.getName();
        List<ChatDTO> chats = chatService.getUserChats(userId);
        return ResponseEntity.ok(chats);
    }

    @PostMapping
    public ResponseEntity<ChatDTO> createChat(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String name = (String) request.get("name");
        Chat.ChatType type = Chat.ChatType.valueOf((String) request.get("type"));
        @SuppressWarnings("unchecked")
        List<String> participants = (List<String>) request.get("participants");
        
        ChatDTO chat = chatService.createChat(name, type, participants);
        return ResponseEntity.ok(chat);
    }

    @PostMapping("/direct/{userId}")
    public ResponseEntity<ChatDTO> getOrCreateDirectChat(
            @PathVariable String userId,
            Authentication authentication) {
        String currentUserId = authentication.getName();
        ChatDTO chat = chatService.getOrCreateDirectChat(currentUserId, userId);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<Page<MessageDTO>> getChatMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MessageDTO> messages = chatService.getChatMessages(chatId, page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long chatId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String senderId = authentication.getName();
        String content = (String) request.get("content");
        Message.MessageType type = Message.MessageType.valueOf(
            (String) request.getOrDefault("type", "TEXT"));
        
        MessageDTO message = chatService.sendMessage(chatId, senderId, content, type);
        return ResponseEntity.ok(message);
    }
}
