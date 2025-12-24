package com.manabandhu.controller;

import com.manabandhu.dto.qa.*;
import com.manabandhu.service.qa.QaService;
import com.manabandhu.service.qa.QaHomeFeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/qa")
@RequiredArgsConstructor
public class QaController {

    private final QaService qaService;
    private final QaHomeFeedService qaHomeFeedService;

    @PostMapping("/questions")
    public ResponseEntity<QuestionResponse> createQuestion(
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        QuestionResponse response = qaService.createQuestion(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/questions")
    public ResponseEntity<Page<QuestionResponse>> getQuestions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "RECENT") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : null;
        Page<QuestionResponse> questions = qaService.getQuestions(search, tags, status, sortBy, page, size, userId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> getQuestion(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : null;
        QuestionResponse question = qaService.getQuestion(id, userId);
        return ResponseEntity.ok(question);
    }

    @GetMapping("/questions/{id}/answers")
    public ResponseEntity<List<AnswerResponse>> getAnswers(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : null;
        List<AnswerResponse> answers = qaService.getAnswers(id, userId);
        return ResponseEntity.ok(answers);
    }

    @PostMapping("/questions/{id}/answers")
    public ResponseEntity<AnswerResponse> createAnswer(
            @PathVariable UUID id,
            @Valid @RequestBody AnswerRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        AnswerResponse response = qaService.createAnswer(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/answers/{id}/accept")
    public ResponseEntity<Void> acceptAnswer(
            @PathVariable UUID id,
            Authentication authentication) {
        String userId = authentication.getName();
        qaService.acceptAnswer(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/votes")
    public ResponseEntity<Void> vote(
            @Valid @RequestBody VoteRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        qaService.vote(request, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/report")
    public ResponseEntity<Void> reportContent(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        qaService.reportContent(request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tags")
    public ResponseEntity<List<TagResponse>> getTags() {
        List<TagResponse> tags = qaService.getTags();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/users/{userId}/questions")
    public ResponseEntity<List<QuestionResponse>> getUserQuestions(
            @PathVariable String userId,
            Authentication authentication) {
        String currentUserId = authentication != null ? authentication.getName() : null;
        List<QuestionResponse> questions = qaService.getUserQuestions(userId, currentUserId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/users/{userId}/answers")
    public ResponseEntity<List<AnswerResponse>> getUserAnswers(
            @PathVariable String userId,
            Authentication authentication) {
        String currentUserId = authentication != null ? authentication.getName() : null;
        List<AnswerResponse> answers = qaService.getUserAnswers(userId, currentUserId);
        return ResponseEntity.ok(answers);
    }

    @GetMapping("/activities/home")
    public ResponseEntity<List<QaHomeFeedService.QaHomeFeedItem>> getHomeFeedActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<QaHomeFeedService.QaHomeFeedItem> activities = qaHomeFeedService.getRecentQaActivities(page, size);
        return ResponseEntity.ok(activities);
    }
}