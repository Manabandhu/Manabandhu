package com.manabandhu.repository;

import com.manabandhu.model.chat.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    @Query("SELECT c FROM Chat c JOIN c.participants p WHERE p = :userId ORDER BY c.lastMessageAt DESC")
    List<Chat> findByParticipantsContaining(@Param("userId") String userId);
    
    @Query("SELECT c FROM Chat c WHERE c.type = 'DIRECT' AND :user1 MEMBER OF c.participants AND :user2 MEMBER OF c.participants")
    Chat findDirectChatBetweenUsers(@Param("user1") String user1, @Param("user2") String user2);
}