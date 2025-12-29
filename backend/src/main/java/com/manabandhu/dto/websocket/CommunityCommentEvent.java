package com.manabandhu.dto.websocket;

import com.manabandhu.dto.CommentDTO;

public class CommunityCommentEvent extends WebSocketMessage {
    private String action; // CREATED, DELETED
    private CommentDTO comment;
    private Long postId;

    public CommunityCommentEvent() {
        super("COMMUNITY_COMMENT");
    }

    public CommunityCommentEvent(String action, CommentDTO comment, Long postId) {
        super("COMMUNITY_COMMENT");
        this.action = action;
        this.comment = comment;
        this.postId = postId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public CommentDTO getComment() {
        return comment;
    }

    public void setComment(CommentDTO comment) {
        this.comment = comment;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }
}

