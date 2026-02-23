package com.manabandhu.dto;

import com.manabandhu.modules.community.discussions.components.model.Comment;

public class CommentDTO extends com.manabandhu.shared.dto.CommentDTO {
    public CommentDTO(Comment comment) {
        super(comment);
    }

    public CommentDTO(Comment comment, String authorName) {
        super(comment, authorName);
    }
}
