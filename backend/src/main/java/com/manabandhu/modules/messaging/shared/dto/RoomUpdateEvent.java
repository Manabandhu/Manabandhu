package com.manabandhu.modules.messaging.shared.dto;

import com.manabandhu.modules.travel.rooms.components.dto.RoomListingResponse;
import java.util.UUID;

public class RoomUpdateEvent extends WebSocketMessage {
    private String action; // CREATED, UPDATED, STATUS_CHANGED, DELETED
    private RoomListingResponse room;
    private UUID roomId;

    public RoomUpdateEvent() {
        super("ROOM_UPDATE");
    }

    public RoomUpdateEvent(String action, RoomListingResponse room) {
        super("ROOM_UPDATE");
        this.action = action;
        this.room = room;
        this.roomId = room != null ? room.getId() : null;
    }

    public RoomUpdateEvent(String action, UUID roomId) {
        super("ROOM_UPDATE");
        this.action = action;
        this.roomId = roomId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public RoomListingResponse getRoom() {
        return room;
    }

    public void setRoom(RoomListingResponse room) {
        this.room = room;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }
}

