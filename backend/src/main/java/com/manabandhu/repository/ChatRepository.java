package com.manabandhu.repository;

import com.manabandhu.modules.messaging.chat.components.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    /**
     * Optimized query - uses subquery instead of JOIN on ElementCollection for better performance.
     * The subquery approach is more efficient than JOIN when dealing with ElementCollection.
     */
    @Query("""
        SELECT DISTINCT c FROM Chat c
        WHERE :userId IN (SELECT p FROM c.participants p)
        ORDER BY c.lastMessageAt DESC NULLS LAST
        """)
    List<Chat> findByParticipantsContaining(@Param("userId") String userId);
    
    /**
     * Optimized query for finding direct chat between two users.
     * Uses subqueries instead of MEMBER OF for better performance.
     */
    @Query("""
        SELECT c FROM Chat c
        WHERE c.type = 'DIRECT'
        AND :user1 IN (SELECT p FROM c.participants p)
        AND :user2 IN (SELECT p FROM c.participants p)
        """)
    Chat findDirectChatBetweenUsers(@Param("user1") String user1, @Param("user2") String user2);
}