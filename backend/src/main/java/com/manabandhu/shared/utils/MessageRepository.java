package com.manabandhu.shared.utils;

import com.manabandhu.modules.messaging.chat.components.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);

    long countByChatId(Long chatId);

    long countDistinctSenderIdByChatId(Long chatId);
    
    /**
     * Efficiently fetch the most recent message for each chat.
     * Uses a window function to get only the latest message per chat.
     */
    @Query(value = """
        SELECT m.* FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY created_at DESC) as rn
            FROM messages
            WHERE chat_id IN :chatIds
        ) m WHERE m.rn = 1
        """, nativeQuery = true)
    List<Message> findLastMessageByChatIds(@Param("chatIds") List<Long> chatIds);
}
