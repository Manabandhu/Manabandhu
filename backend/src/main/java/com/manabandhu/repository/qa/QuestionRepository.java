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

    @Query(value = "SELECT q.* FROM questions q WHERE " +
           "(:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.body) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tags IS NULL OR CAST(:tags AS text[]) = CAST('{}' AS text[]) OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(q.tags::jsonb) tag WHERE tag::text IN (:tags))) AND " +
           "(:status IS NULL OR q.status = CAST(:status AS varchar)) " +
           "ORDER BY " +
           "CASE WHEN :sortBy = 'RECENT' THEN q.created_at END DESC NULLS LAST, " +
           "CASE WHEN :sortBy = 'VIEWS' THEN q.views_count END DESC NULLS LAST",
           countQuery = "SELECT COUNT(q.id) FROM questions q WHERE " +
           "(:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.body) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tags IS NULL OR CAST(:tags AS text[]) = CAST('{}' AS text[]) OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(q.tags::jsonb) tag WHERE tag::text IN (:tags))) AND " +
           "(:status IS NULL OR q.status = CAST(:status AS varchar))",
           nativeQuery = true)
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