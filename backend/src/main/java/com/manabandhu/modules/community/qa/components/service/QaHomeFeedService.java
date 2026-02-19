package com.manabandhu.modules.community.qa.components.service;

import com.manabandhu.modules.community.qa.components.model.QaActivity;
import com.manabandhu.modules.community.qa.components.model.Question;
import com.manabandhu.repository.UserRepository;
import com.manabandhu.modules.community.qa.components.repository.QaActivityRepository;
import com.manabandhu.modules.community.qa.components.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QaHomeFeedService {

    private final QaActivityRepository qaActivityRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public List<QaHomeFeedItem> getRecentQaActivities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<QaActivity> activities = qaActivityRepository.findAllByOrderByCreatedAtDesc(pageable);
        
        // Get all question IDs
        List<String> questionIds = activities.getContent().stream()
            .map(activity -> activity.getQuestionId().toString())
            .distinct()
            .collect(Collectors.toList());
        
        // Fetch questions in batch
        Map<String, Question> questionsMap = questionRepository.findAllById(
            questionIds.stream().map(java.util.UUID::fromString).collect(Collectors.toList())
        ).stream().collect(Collectors.toMap(
            q -> q.getId().toString(),
            q -> q
        ));
        
        // Get user names
        List<String> userIds = activities.getContent().stream()
            .map(QaActivity::getActorUserId)
            .distinct()
            .collect(Collectors.toList());
        
        Map<String, String> userNames = userRepository.findAll().stream()
            .filter(user -> userIds.contains(user.getFirebaseUid()))
            .collect(Collectors.toMap(
                user -> user.getFirebaseUid(),
                user -> user.getName()
            ));
        
        return activities.getContent().stream()
            .map(activity -> {
                Question question = questionsMap.get(activity.getQuestionId().toString());
                if (question == null) return null;
                
                QaHomeFeedItem item = new QaHomeFeedItem();
                item.setActivityType(activity.getType());
                item.setActorUserId(activity.getActorUserId());
                item.setActorName(userNames.get(activity.getActorUserId()));
                item.setQuestionId(question.getId().toString());
                item.setQuestionTitle(question.getTitle());
                item.setQuestionTags(question.getTags());
                item.setCreatedAt(activity.getCreatedAt());
                
                return item;
            })
            .filter(item -> item != null)
            .collect(Collectors.toList());
    }

    public static class QaHomeFeedItem {
        private QaActivity.ActivityType activityType;
        private String actorUserId;
        private String actorName;
        private String questionId;
        private String questionTitle;
        private List<String> questionTags;
        private LocalDateTime createdAt;

        // Getters and setters
        public QaActivity.ActivityType getActivityType() { return activityType; }
        public void setActivityType(QaActivity.ActivityType activityType) { this.activityType = activityType; }
        
        public String getActorUserId() { return actorUserId; }
        public void setActorUserId(String actorUserId) { this.actorUserId = actorUserId; }
        
        public String getActorName() { return actorName; }
        public void setActorName(String actorName) { this.actorName = actorName; }
        
        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }
        
        public String getQuestionTitle() { return questionTitle; }
        public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }
        
        public List<String> getQuestionTags() { return questionTags; }
        public void setQuestionTags(List<String> questionTags) { this.questionTags = questionTags; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public String getActivityMessage() {
            switch (activityType) {
                case QUESTION_POSTED:
                    return actorName + " asked a question about " + String.join(", ", questionTags);
                case ANSWER_POSTED:
                    return actorName + " answered a question";
                case ANSWER_ACCEPTED:
                    return actorName + " accepted an answer";
                default:
                    return actorName + " had Q&A activity";
            }
        }
    }
}