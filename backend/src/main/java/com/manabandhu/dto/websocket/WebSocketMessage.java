package com.manabandhu.dto.websocket;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = ChatMessageEvent.class, name = "CHAT_MESSAGE"),
    @JsonSubTypes.Type(value = NotificationEvent.class, name = "NOTIFICATION"),
    @JsonSubTypes.Type(value = CommunityPostEvent.class, name = "COMMUNITY_POST"),
    @JsonSubTypes.Type(value = CommunityCommentEvent.class, name = "COMMUNITY_COMMENT"),
    @JsonSubTypes.Type(value = RideUpdateEvent.class, name = "RIDE_UPDATE"),
    @JsonSubTypes.Type(value = RoomUpdateEvent.class, name = "ROOM_UPDATE"),
    @JsonSubTypes.Type(value = QaUpdateEvent.class, name = "QA_UPDATE")
})
public abstract class WebSocketMessage {
    private String type;
    private Long timestamp;

    public WebSocketMessage(String type) {
        this.type = type;
        this.timestamp = System.currentTimeMillis();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}

