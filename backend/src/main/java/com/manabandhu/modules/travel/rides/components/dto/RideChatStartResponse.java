package com.manabandhu.modules.travel.rides.components.dto;

public class RideChatStartResponse {
    private String chatThreadId;

    public RideChatStartResponse(String chatThreadId) {
        this.chatThreadId = chatThreadId;
    }

    public String getChatThreadId() {
        return chatThreadId;
    }
}
