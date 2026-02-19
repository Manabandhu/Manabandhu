package com.manabandhu.modules.messaging.shared.dto;

import com.manabandhu.dto.MessageDTO;

public class ChatMessageEvent extends WebSocketMessage {
    private MessageDTO message;
    private Long chatId;

    public ChatMessageEvent() {
        super("CHAT_MESSAGE");
    }

    public ChatMessageEvent(MessageDTO message, Long chatId) {
        super("CHAT_MESSAGE");
        this.message = message;
        this.chatId = chatId;
    }

    public MessageDTO getMessage() {
        return message;
    }

    public void setMessage(MessageDTO message) {
        this.message = message;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
}

