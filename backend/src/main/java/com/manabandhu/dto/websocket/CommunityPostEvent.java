package com.manabandhu.dto.websocket;

import com.manabandhu.dto.CommunityPostDTO;

public class CommunityPostEvent extends WebSocketMessage {
    private String action; // CREATED, UPDATED, DELETED, LIKED
    private CommunityPostDTO post;

    public CommunityPostEvent() {
        super("COMMUNITY_POST");
    }

    public CommunityPostEvent(String action, CommunityPostDTO post) {
        super("COMMUNITY_POST");
        this.action = action;
        this.post = post;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public CommunityPostDTO getPost() {
        return post;
    }

    public void setPost(CommunityPostDTO post) {
        this.post = post;
    }
}

