package com.manabandhu.dto.qa;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AnswerResponse {
    private UUID id;
    private UUID questionId;
    private String authorUserId;
    private String authorName;
    private String body;
    private Integer upvotes;
    private Integer downvotes;
    private Boolean isAccepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isAuthor;
    private String userVote; // UPVOTE, DOWNVOTE, or null
}