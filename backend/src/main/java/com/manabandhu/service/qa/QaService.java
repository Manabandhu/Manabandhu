package com.manabandhu.service.qa;

import com.manabandhu.dto.qa.*;
import com.manabandhu.exception.ResourceNotFoundException;
import com.manabandhu.exception.UnauthorizedException;
import com.manabandhu.exception.ValidationException;
import com.manabandhu.model.qa.*;
import com.manabandhu.repository.UserRepository;
import com.manabandhu.repository.qa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QaService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final VoteRepository voteRepository;
    private final TagRepository tagRepository;
    private final QaActivityRepository qaActivityRepository;
    private final ReportedContentRepository reportedContentRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request, String userId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            validateQuestionRequest(request);
            validateTags(request.getTags());
            
            Question question = new Question();
            question.setAuthorUserId(userId);
            question.setTitle(request.getTitle().trim());
            question.setBody(request.getBody().trim());
            question.setTags(request.getTags());
            
            question = questionRepository.save(question);
            log.info("Question created with ID: {} by user: {}", question.getId(), userId);
            
            // Create activity
            createActivity(QaActivity.ActivityType.QUESTION_POSTED, question.getId(), userId);
            
            return mapToQuestionResponse(question, userId);
        } catch (Exception e) {
            log.error("Error creating question for user {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public Page<QuestionResponse> getQuestions(String search, List<String> tags, String status, String sortBy, int page, int size, String userId) {
        try {
            if (page < 0 || size <= 0 || size > 100) {
                throw new ValidationException("Invalid pagination parameters");
            }
            
            Question.QuestionStatus questionStatus = null;
            if (StringUtils.hasText(status)) {
                try {
                    questionStatus = Question.QuestionStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new ValidationException("Invalid status: " + status);
                }
            }
            
            String validSortBy = validateSortBy(sortBy);
            Pageable pageable = PageRequest.of(page, size);
            
            Page<Question> questions = questionRepository.findQuestionsWithFilters(
                StringUtils.hasText(search) ? search.trim() : null, 
                tags, 
                questionStatus, 
                validSortBy, 
                pageable
            );
            
            return questions.map(q -> mapToQuestionResponse(q, userId));
        } catch (Exception e) {
            log.error("Error fetching questions: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public QuestionResponse getQuestion(UUID id, String userId) {
        try {
            if (id == null) {
                throw new ValidationException("Question ID is required");
            }
            
            Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));
            
            questionRepository.incrementViewCount(id);
            log.debug("Question {} viewed by user {}", id, userId);
            
            return mapToQuestionResponse(question, userId);
        } catch (Exception e) {
            log.error("Error fetching question {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public List<AnswerResponse> getAnswers(UUID questionId, String userId) {
        try {
            if (questionId == null) {
                throw new ValidationException("Question ID is required");
            }
            
            // Verify question exists
            if (!questionRepository.existsById(questionId)) {
                throw new ResourceNotFoundException("Question not found with ID: " + questionId);
            }
            
            List<Answer> answers = answerRepository.findByQuestionIdOrderByAcceptedAndVotes(questionId);
            Map<UUID, Vote> userVotes = getUserVotesForAnswers(
                answers.stream().map(Answer::getId).collect(Collectors.toList()), 
                userId
            );
            
            return answers.stream()
                .map(answer -> mapToAnswerResponse(answer, userId, userVotes.get(answer.getId())))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching answers for question {}: {}", questionId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public AnswerResponse createAnswer(UUID questionId, AnswerRequest request, String userId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            validateAnswerRequest(request);
            
            Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + questionId));
            
            if (question.getStatus() == Question.QuestionStatus.CLOSED) {
                throw new ValidationException("Cannot answer a closed question");
            }
            
            Answer answer = new Answer();
            answer.setQuestionId(questionId);
            answer.setAuthorUserId(userId);
            answer.setBody(request.getBody().trim());
            
            answer = answerRepository.save(answer);
            questionRepository.incrementAnswerCount(questionId);
            
            log.info("Answer created with ID: {} for question: {} by user: {}", answer.getId(), questionId, userId);
            
            createActivity(QaActivity.ActivityType.ANSWER_POSTED, questionId, userId);
            
            return mapToAnswerResponse(answer, userId, null);
        } catch (Exception e) {
            log.error("Error creating answer for question {} by user {}: {}", questionId, userId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void acceptAnswer(UUID answerId, String userId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + answerId));
            
            Question question = questionRepository.findById(answer.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
            
            if (!question.getAuthorUserId().equals(userId)) {
                throw new UnauthorizedException("Only question author can accept answers");
            }
            
            if (question.getStatus() == Question.QuestionStatus.CLOSED) {
                throw new ValidationException("Cannot accept answer for a closed question");
            }
            
            // Unaccept previous answer if exists
            if (question.getAcceptedAnswerId() != null) {
                answerRepository.findById(question.getAcceptedAnswerId())
                    .ifPresent(prevAnswer -> {
                        prevAnswer.setIsAccepted(false);
                        answerRepository.save(prevAnswer);
                    });
            }
            
            answer.setIsAccepted(true);
            answerRepository.save(answer);
            
            question.setAcceptedAnswerId(answerId);
            question.setStatus(Question.QuestionStatus.ANSWERED);
            questionRepository.save(question);
            
            log.info("Answer {} accepted for question {} by user {}", answerId, question.getId(), userId);
            
            createActivity(QaActivity.ActivityType.ANSWER_ACCEPTED, question.getId(), userId);
        } catch (Exception e) {
            log.error("Error accepting answer {} by user {}: {}", answerId, userId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void vote(VoteRequest request, String userId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            validateVoteRequest(request);
            
            if (request.getTargetType() == Vote.TargetType.ANSWER) {
                Answer answer = answerRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
                
                if (answer.getAuthorUserId().equals(userId)) {
                    throw new ValidationException("Cannot vote on your own answer");
                }
            }
            
            Vote existingVote = voteRepository.findByTargetTypeAndTargetIdAndUserId(
                request.getTargetType(), request.getTargetId(), userId
            ).orElse(null);
            
            if (existingVote != null) {
                handleExistingVote(existingVote, request, userId);
            } else {
                createNewVote(request, userId);
            }
            
            log.debug("Vote processed for {} {} by user {}", request.getTargetType(), request.getTargetId(), userId);
        } catch (Exception e) {
            log.error("Error processing vote by user {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void reportContent(ReportRequest request, String userId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            validateReportRequest(request);
            
            if (reportedContentRepository.existsByContentTypeAndContentIdAndReportedByUserId(
                request.getContentType(), request.getContentId(), userId)) {
                throw new ValidationException("Content already reported by user");
            }
            
            ReportedContent report = new ReportedContent();
            report.setContentType(request.getContentType());
            report.setContentId(request.getContentId());
            report.setReportedByUserId(userId);
            report.setReason(request.getReason());
            
            reportedContentRepository.save(report);
            log.info("Content reported: {} {} by user {} for reason {}", 
                request.getContentType(), request.getContentId(), userId, request.getReason());
        } catch (Exception e) {
            log.error("Error reporting content by user {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public List<TagResponse> getTags() {
        try {
            return tagRepository.findByIsSystemTagTrueOrderByName().stream()
                .map(this::mapToTagResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching tags: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch tags", e);
        }
    }

    public List<QuestionResponse> getUserQuestions(String userId, String currentUserId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new ValidationException("User ID is required");
            }
            
            return questionRepository.findByAuthorUserIdOrderByCreatedAtDesc(userId).stream()
                .map(q -> mapToQuestionResponse(q, currentUserId))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching user questions for {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public List<AnswerResponse> getUserAnswers(String userId, String currentUserId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new ValidationException("User ID is required");
            }
            
            List<Answer> answers = answerRepository.findByAuthorUserIdOrderByCreatedAtDesc(userId);
            Map<UUID, Vote> userVotes = getUserVotesForAnswers(
                answers.stream().map(Answer::getId).collect(Collectors.toList()), 
                currentUserId
            );
            
            return answers.stream()
                .map(answer -> mapToAnswerResponse(answer, currentUserId, userVotes.get(answer.getId())))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching user answers for {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    // Private helper methods
    private void validateQuestionRequest(QuestionRequest request) {
        if (request == null) {
            throw new ValidationException("Question request is required");
        }
        if (!StringUtils.hasText(request.getTitle()) || request.getTitle().trim().length() < 10) {
            throw new ValidationException("Question title must be at least 10 characters");
        }
        if (!StringUtils.hasText(request.getBody()) || request.getBody().trim().length() < 20) {
            throw new ValidationException("Question body must be at least 20 characters");
        }
        if (request.getTags() == null || request.getTags().isEmpty()) {
            throw new ValidationException("At least one tag is required");
        }
        if (request.getTags().size() > 5) {
            throw new ValidationException("Maximum 5 tags allowed");
        }
    }

    private void validateAnswerRequest(AnswerRequest request) {
        if (request == null) {
            throw new ValidationException("Answer request is required");
        }
        if (!StringUtils.hasText(request.getBody()) || request.getBody().trim().length() < 10) {
            throw new ValidationException("Answer must be at least 10 characters");
        }
    }

    private void validateVoteRequest(VoteRequest request) {
        if (request == null) {
            throw new ValidationException("Vote request is required");
        }
        if (request.getTargetType() == null) {
            throw new ValidationException("Target type is required");
        }
        if (request.getTargetId() == null) {
            throw new ValidationException("Target ID is required");
        }
        if (request.getVoteType() == null) {
            throw new ValidationException("Vote type is required");
        }
    }

    private void validateReportRequest(ReportRequest request) {
        if (request == null) {
            throw new ValidationException("Report request is required");
        }
        if (request.getContentType() == null) {
            throw new ValidationException("Content type is required");
        }
        if (request.getContentId() == null) {
            throw new ValidationException("Content ID is required");
        }
        if (request.getReason() == null) {
            throw new ValidationException("Report reason is required");
        }
    }

    private void validateTags(List<String> tags) {
        for (String tag : tags) {
            if (!StringUtils.hasText(tag)) {
                throw new ValidationException("Empty tags are not allowed");
            }
            if (!tagRepository.existsByName(tag.trim())) {
                throw new ValidationException("Invalid tag: " + tag);
            }
        }
    }

    private String validateSortBy(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return "RECENT";
        }
        if (!"RECENT".equals(sortBy) && !"VIEWS".equals(sortBy)) {
            throw new ValidationException("Invalid sort option. Use RECENT or VIEWS");
        }
        return sortBy;
    }

    private void handleExistingVote(Vote existingVote, VoteRequest request, String userId) {
        if (existingVote.getVoteType() == request.getVoteType()) {
            // Remove vote
            voteRepository.delete(existingVote);
            updateVoteCounts(request.getTargetType(), request.getTargetId(), request.getVoteType(), -1);
        } else {
            // Change vote
            updateVoteCounts(request.getTargetType(), request.getTargetId(), existingVote.getVoteType(), -1);
            existingVote.setVoteType(request.getVoteType());
            voteRepository.save(existingVote);
            updateVoteCounts(request.getTargetType(), request.getTargetId(), request.getVoteType(), 1);
        }
    }

    private void createNewVote(VoteRequest request, String userId) {
        Vote vote = new Vote();
        vote.setTargetType(request.getTargetType());
        vote.setTargetId(request.getTargetId());
        vote.setUserId(userId);
        vote.setVoteType(request.getVoteType());
        voteRepository.save(vote);
        updateVoteCounts(request.getTargetType(), request.getTargetId(), request.getVoteType(), 1);
    }

    private void createActivity(QaActivity.ActivityType type, UUID questionId, String userId) {
        try {
            QaActivity activity = new QaActivity();
            activity.setType(type);
            activity.setQuestionId(questionId);
            activity.setActorUserId(userId);
            qaActivityRepository.save(activity);
        } catch (Exception e) {
            log.warn("Failed to create activity {}: {}", type, e.getMessage());
            // Don't fail the main operation if activity creation fails
        }
    }

    private void updateVoteCounts(Vote.TargetType targetType, UUID targetId, Vote.VoteType voteType, int delta) {
        if (targetType == Vote.TargetType.ANSWER) {
            if (voteType == Vote.VoteType.UPVOTE) {
                answerRepository.updateUpvotes(targetId, delta);
            } else {
                answerRepository.updateDownvotes(targetId, delta);
            }
        }
    }

    private Map<UUID, Vote> getUserVotesForAnswers(List<UUID> answerIds, String userId) {
        if (!StringUtils.hasText(userId) || answerIds.isEmpty()) {
            return Map.of();
        }
        
        return voteRepository.findAll().stream()
            .filter(vote -> vote.getTargetType() == Vote.TargetType.ANSWER && 
                           answerIds.contains(vote.getTargetId()) && 
                           vote.getUserId().equals(userId))
            .collect(Collectors.toMap(Vote::getTargetId, vote -> vote));
    }

    private QuestionResponse mapToQuestionResponse(Question question, String userId) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setAuthorUserId(question.getAuthorUserId());
        response.setTitle(question.getTitle());
        response.setBody(question.getBody());
        response.setTags(question.getTags());
        response.setStatus(question.getStatus());
        response.setViewsCount(question.getViewsCount());
        response.setAnswersCount(question.getAnswersCount());
        response.setAcceptedAnswerId(question.getAcceptedAnswerId());
        response.setCreatedAt(question.getCreatedAt());
        response.setUpdatedAt(question.getUpdatedAt());
        response.setIsAuthor(StringUtils.hasText(userId) && question.getAuthorUserId().equals(userId));
        
        // Get author name
        try {
            userRepository.findByFirebaseUid(question.getAuthorUserId())
                .ifPresent(user -> response.setAuthorName(user.getName()));
        } catch (Exception e) {
            log.warn("Failed to fetch author name for question {}: {}", question.getId(), e.getMessage());
        }
        
        return response;
    }

    private AnswerResponse mapToAnswerResponse(Answer answer, String userId, Vote userVote) {
        AnswerResponse response = new AnswerResponse();
        response.setId(answer.getId());
        response.setQuestionId(answer.getQuestionId());
        response.setAuthorUserId(answer.getAuthorUserId());
        response.setBody(answer.getBody());
        response.setUpvotes(answer.getUpvotes());
        response.setDownvotes(answer.getDownvotes());
        response.setIsAccepted(answer.getIsAccepted());
        response.setCreatedAt(answer.getCreatedAt());
        response.setUpdatedAt(answer.getUpdatedAt());
        response.setIsAuthor(StringUtils.hasText(userId) && answer.getAuthorUserId().equals(userId));
        response.setUserVote(userVote != null ? userVote.getVoteType().name() : null);
        
        // Get author name
        try {
            userRepository.findByFirebaseUid(answer.getAuthorUserId())
                .ifPresent(user -> response.setAuthorName(user.getName()));
        } catch (Exception e) {
            log.warn("Failed to fetch author name for answer {}: {}", answer.getId(), e.getMessage());
        }
        
        return response;
    }

    private TagResponse mapToTagResponse(Tag tag) {
        TagResponse response = new TagResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        response.setCategory(tag.getCategory());
        response.setIsSystemTag(tag.getIsSystemTag());
        return response;
    }
}