package com.manabandhu.dto;

import com.manabandhu.model.chat.Chat;
import java.time.LocalDateTime;
import java.util.List;

public class ChatDTO {
    private Long id;
    private String name;
    private Chat.ChatType type;
    private Chat.ChatContext context;
    private List<String> participants;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private MessageDTO lastMessage;

    public ChatDTO() {}

    public ChatDTO(Chat chat) {
        this.id = chat.getId();
        this.name = chat.getName();
        this.type = chat.getType();
        this.context = chat.getContext();
        this.participants = chat.getParticipants();
        this.createdAt = chat.getCreatedAt();
        this.lastMessageAt = chat.getLastMessageAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Chat.ChatType getType() { return type; }
    public void setType(Chat.ChatType type) { this.type = type; }

    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public MessageDTO getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageDTO lastMessage) { this.lastMessage = lastMessage; }

    public Chat.ChatContext getContext() { return context; }
    public void setContext(Chat.ChatContext context) { this.context = context; }
}

class CreateChatRequest {
    private String name;
    private Chat.ChatType type;
    private List<String> participants;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Chat.ChatType getType() { return type; }
    public void setType(Chat.ChatType type) { this.type = type; }

    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }
}