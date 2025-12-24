package com.manabandhu.repository.qa;

import com.manabandhu.model.qa.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    @Query("SELECT a FROM Answer a WHERE a.questionId = :questionId ORDER BY a.isAccepted DESC, a.upvotes DESC, a.createdAt ASC")
    List<Answer> findByQuestionIdOrderByAcceptedAndVotes(@Param("questionId") UUID questionId);

    List<Answer> findByAuthorUserIdOrderByCreatedAtDesc(String authorUserId);

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.authorUserId = :userId AND a.isAccepted = true")
    Long countAcceptedAnswersByUser(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE Answer a SET a.upvotes = a.upvotes + :delta WHERE a.id = :id")
    void updateUpvotes(@Param("id") UUID id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Answer a SET a.downvotes = a.downvotes + :delta WHERE a.id = :id")
    void updateDownvotes(@Param("id") UUID id, @Param("delta") int delta);
}