package com.manabandhu.dto;

import com.manabandhu.model.chat.Message;
import java.time.LocalDateTime;

public class MessageDTO {
    private Long id;
    private Long chatId;
    private String senderId;
    private String content;
    private Message.MessageType type;
    private LocalDateTime createdAt;

    public MessageDTO() {}

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.chatId = message.getChatId();
        this.senderId = message.getSenderId();
        this.content = message.getContent();
        this.type = message.getType();
        this.createdAt = message.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Message.MessageType getType() { return type; }
    public void setType(Message.MessageType type) { this.type = type; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

class SendMessageRequest {
    private String content;
    private Message.MessageType type = Message.MessageType.TEXT;

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Message.MessageType getType() { return type; }
    public void setType(Message.MessageType type) { this.type = type; }
}