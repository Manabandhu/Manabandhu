package com.manabandhu.dto.rooms;

public class ChatStartResponse {
    private String chatThreadId;

    public ChatStartResponse(String chatThreadId) {
        this.chatThreadId = chatThreadId;
    }

    public String getChatThreadId() {
        return chatThreadId;
    }
}
