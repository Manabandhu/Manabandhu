package com.manabandhu.dto.websocket;

import com.manabandhu.dto.qa.QuestionResponse;
import com.manabandhu.dto.qa.AnswerResponse;

import java.util.UUID;

public class QaUpdateEvent extends WebSocketMessage {
    private String action; // QUESTION_CREATED, ANSWER_CREATED, ANSWER_UPDATED, VOTE_CHANGED
    private QuestionResponse question;
    private AnswerResponse answer;
    private UUID questionId;
    private UUID answerId;

    public QaUpdateEvent() {
        super("QA_UPDATE");
    }

    public QaUpdateEvent(String action, QuestionResponse question) {
        super("QA_UPDATE");
        this.action = action;
        this.question = question;
        this.questionId = question != null ? question.getId() : null;
    }

    public QaUpdateEvent(String action, AnswerResponse answer, UUID questionId) {
        super("QA_UPDATE");
        this.action = action;
        this.answer = answer;
        this.questionId = questionId;
        this.answerId = answer != null ? answer.getId() : null;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public QuestionResponse getQuestion() {
        return question;
    }

    public void setQuestion(QuestionResponse question) {
        this.question = question;
    }

    public AnswerResponse getAnswer() {
        return answer;
    }

    public void setAnswer(AnswerResponse answer) {
        this.answer = answer;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }

    public UUID getAnswerId() {
        return answerId;
    }

    public void setAnswerId(UUID answerId) {
        this.answerId = answerId;
    }
}

