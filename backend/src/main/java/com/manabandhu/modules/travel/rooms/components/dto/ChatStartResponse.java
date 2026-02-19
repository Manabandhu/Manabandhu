package com.manabandhu.modules.travel.rooms.components.dto;

public class ChatStartResponse {
    private String chatThreadId;

    public ChatStartResponse(String chatThreadId) {
        this.chatThreadId = chatThreadId;
    }

    public String getChatThreadId() {
        return chatThreadId;
    }
}
