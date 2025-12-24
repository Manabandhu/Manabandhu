package com.manabandhu.repository.qa;

import com.manabandhu.model.qa.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    @Query("SELECT q FROM Question q WHERE " +
           "(:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.body) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tags IS NULL OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(CAST(q.tags AS jsonb)) tag WHERE tag IN :tags)) AND " +
           "(:status IS NULL OR q.status = :status) " +
           "ORDER BY " +
           "CASE WHEN :sortBy = 'RECENT' THEN q.createdAt END DESC, " +
           "CASE WHEN :sortBy = 'VIEWS' THEN q.viewsCount END DESC")
    Page<Question> findQuestionsWithFilters(
        @Param("search") String search,
        @Param("tags") List<String> tags,
        @Param("status") Question.QuestionStatus status,
        @Param("sortBy") String sortBy,
        Pageable pageable
    );

    List<Question> findByAuthorUserIdOrderByCreatedAtDesc(String authorUserId);

    @Modifying
    @Query("UPDATE Question q SET q.viewsCount = q.viewsCount + 1 WHERE q.id = :id")
    void incrementViewCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Question q SET q.answersCount = q.answersCount + 1 WHERE q.id = :id")
    void incrementAnswerCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Question q SET q.answersCount = q.answersCount - 1 WHERE q.id = :id AND q.answersCount > 0")
    void decrementAnswerCount(@Param("id") UUID id);
}