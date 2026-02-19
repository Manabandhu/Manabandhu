package com.manabandhu.shared.dto;

import com.manabandhu.modules.messaging.chat.components.model.Message;

public class SendMessageRequest {
    private Long chatId;
    private String content;
    private Message.MessageType type = Message.MessageType.TEXT;

    // Getters and Setters
    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Message.MessageType getType() { return type; }
    public void setType(Message.MessageType type) { this.type = type; }
}

