package com.manabandhu.service.qa;

import com.manabandhu.dto.qa.*;
import com.manabandhu.exception.ResourceNotFoundException;
import com.manabandhu.model.User;
import com.manabandhu.model.qa.*;
import com.manabandhu.repository.UserRepository;
import com.manabandhu.repository.qa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        validateTags(request.getTags());
        
        Question question = new Question();
        question.setAuthorUserId(userId);
        question.setTitle(request.getTitle());
        question.setBody(request.getBody());
        question.setTags(request.getTags());
        
        question = questionRepository.save(question);
        
        // Create activity
        QaActivity activity = new QaActivity();
        activity.setType(QaActivity.ActivityType.QUESTION_POSTED);
        activity.setQuestionId(question.getId());
        activity.setActorUserId(userId);
        qaActivityRepository.save(activity);
        
        return mapToQuestionResponse(question, userId);
    }

    public Page<QuestionResponse> getQuestions(String search, List<String> tags, String status, String sortBy, int page, int size, String userId) {
        Question.QuestionStatus questionStatus = status != null ? Question.QuestionStatus.valueOf(status) : null;
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Question> questions = questionRepository.findQuestionsWithFilters(search, tags, questionStatus, sortBy, pageable);
        return questions.map(q -> mapToQuestionResponse(q, userId));
    }

    @Transactional
    public QuestionResponse getQuestion(UUID id, String userId) {
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        questionRepository.incrementViewCount(id);
        return mapToQuestionResponse(question, userId);
    }

    public List<AnswerResponse> getAnswers(UUID questionId, String userId) {
        List<Answer> answers = answerRepository.findByQuestionIdOrderByAcceptedAndVotes(questionId);
        Map<UUID, Vote> userVotes = getUserVotesForAnswers(answers.stream().map(Answer::getId).collect(Collectors.toList()), userId);
        
        return answers.stream()
            .map(answer -> mapToAnswerResponse(answer, userId, userVotes.get(answer.getId())))
            .collect(Collectors.toList());
    }

    @Transactional
    public AnswerResponse createAnswer(UUID questionId, AnswerRequest request, String userId) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setAuthorUserId(userId);
        answer.setBody(request.getBody());
        
        answer = answerRepository.save(answer);
        questionRepository.incrementAnswerCount(questionId);
        
        // Create activity
        QaActivity activity = new QaActivity();
        activity.setType(QaActivity.ActivityType.ANSWER_POSTED);
        activity.setQuestionId(questionId);
        activity.setActorUserId(userId);
        qaActivityRepository.save(activity);
        
        return mapToAnswerResponse(answer, userId, null);
    }

    @Transactional
    public void acceptAnswer(UUID answerId, String userId) {
        Answer answer = answerRepository.findById(answerId)
            .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
        
        Question question = questionRepository.findById(answer.getQuestionId())
            .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        if (!question.getAuthorUserId().equals(userId)) {
            throw new IllegalArgumentException("Only question author can accept answers");
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
        
        // Create activity
        QaActivity activity = new QaActivity();
        activity.setType(QaActivity.ActivityType.ANSWER_ACCEPTED);
        activity.setQuestionId(question.getId());
        activity.setActorUserId(userId);
        qaActivityRepository.save(activity);
    }

    @Transactional
    public void vote(VoteRequest request, String userId) {
        if (request.getTargetType() == Vote.TargetType.ANSWER) {
            Answer answer = answerRepository.findById(request.getTargetId())
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
            
            if (answer.getAuthorUserId().equals(userId)) {
                throw new IllegalArgumentException("Cannot vote on your own answer");
            }
        }
        
        Vote existingVote = voteRepository.findByTargetTypeAndTargetIdAndUserId(
            request.getTargetType(), request.getTargetId(), userId
        ).orElse(null);
        
        if (existingVote != null) {
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
        } else {
            // New vote
            Vote vote = new Vote();
            vote.setTargetType(request.getTargetType());
            vote.setTargetId(request.getTargetId());
            vote.setUserId(userId);
            vote.setVoteType(request.getVoteType());
            voteRepository.save(vote);
            updateVoteCounts(request.getTargetType(), request.getTargetId(), request.getVoteType(), 1);
        }
    }

    @Transactional
    public void reportContent(ReportRequest request, String userId) {
        if (reportedContentRepository.existsByContentTypeAndContentIdAndReportedByUserId(
            request.getContentType(), request.getContentId(), userId)) {
            throw new IllegalArgumentException("Content already reported by user");
        }
        
        ReportedContent report = new ReportedContent();
        report.setContentType(request.getContentType());
        report.setContentId(request.getContentId());
        report.setReportedByUserId(userId);
        report.setReason(request.getReason());
        
        reportedContentRepository.save(report);
    }

    public List<TagResponse> getTags() {
        return tagRepository.findByIsSystemTagTrueOrderByName().stream()
            .map(this::mapToTagResponse)
            .collect(Collectors.toList());
    }

    public List<QuestionResponse> getUserQuestions(String userId, String currentUserId) {
        return questionRepository.findByAuthorUserIdOrderByCreatedAtDesc(userId).stream()
            .map(q -> mapToQuestionResponse(q, currentUserId))
            .collect(Collectors.toList());
    }

    public List<AnswerResponse> getUserAnswers(String userId, String currentUserId) {
        List<Answer> answers = answerRepository.findByAuthorUserIdOrderByCreatedAtDesc(userId);
        Map<UUID, Vote> userVotes = getUserVotesForAnswers(answers.stream().map(Answer::getId).collect(Collectors.toList()), currentUserId);
        
        return answers.stream()
            .map(answer -> mapToAnswerResponse(answer, currentUserId, userVotes.get(answer.getId())))
            .collect(Collectors.toList());
    }

    private void validateTags(List<String> tags) {
        for (String tag : tags) {
            if (!tagRepository.existsByName(tag)) {
                throw new IllegalArgumentException("Invalid tag: " + tag);
            }
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
        if (userId == null) return Map.of();
        
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
        response.setIsAuthor(question.getAuthorUserId().equals(userId));
        
        // Get author name
        userRepository.findByFirebaseUid(question.getAuthorUserId())
            .ifPresent(user -> response.setAuthorName(user.getName()));
        
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
        response.setIsAuthor(answer.getAuthorUserId().equals(userId));
        response.setUserVote(userVote != null ? userVote.getVoteType().name() : null);
        
        // Get author name
        userRepository.findByFirebaseUid(answer.getAuthorUserId())
            .ifPresent(user -> response.setAuthorName(user.getName()));
        
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