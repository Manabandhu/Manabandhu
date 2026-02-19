package com.manabandhu.modules.community.qa.components.dto;

import com.manabandhu.modules.community.qa.components.model.Question;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class QuestionResponse {
    private UUID id;
    private String authorUserId;
    private String authorName;
    private String title;
    private String body;
    private List<String> tags;
    private Question.QuestionStatus status;
    private Integer viewsCount;
    private Integer answersCount;
    private UUID acceptedAnswerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isAuthor;
}