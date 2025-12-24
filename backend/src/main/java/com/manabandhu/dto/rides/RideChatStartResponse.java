package com.manabandhu.dto.rides;

public class RideChatStartResponse {
    private String chatThreadId;

    public RideChatStartResponse(String chatThreadId) {
        this.chatThreadId = chatThreadId;
    }

    public String getChatThreadId() {
        return chatThreadId;
    }
}
