package com.manabandhu.service;

import com.manabandhu.dto.ChatDTO;
import com.manabandhu.dto.MessageDTO;
import com.manabandhu.dto.websocket.ChatMessageEvent;
import com.manabandhu.model.chat.Chat;
import com.manabandhu.model.chat.Message;
import com.manabandhu.repository.ChatRepository;
import com.manabandhu.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private WebSocketService webSocketService;

    public List<ChatDTO> getUserChats(String userId) {
        List<Chat> chats = chatRepository.findByParticipantsContaining(userId);
        return chats.stream().map(ChatDTO::new).collect(Collectors.toList());
    }

    public ChatDTO createChat(String name, Chat.ChatType type, List<String> participants) {
        Chat chat = new Chat(name, type, participants);
        chat = chatRepository.save(chat);
        return new ChatDTO(chat);
    }

    public ChatDTO createChat(String name, Chat.ChatType type, List<String> participants, Chat.ChatContext context) {
        Chat chat = new Chat(name, type, participants, context);
        chat = chatRepository.save(chat);
        return new ChatDTO(chat);
    }

    public ChatDTO getOrCreateDirectChat(String user1, String user2) {
        Chat existingChat = chatRepository.findDirectChatBetweenUsers(user1, user2);
        if (existingChat != null) {
            return new ChatDTO(existingChat);
        }
        
        List<String> participants = List.of(user1, user2);
        String chatName = "Direct Chat";
        Chat chat = new Chat(chatName, Chat.ChatType.DIRECT, participants, Chat.ChatContext.ONE_ON_ONE);
        chat = chatRepository.save(chat);
        return new ChatDTO(chat);
    }

    public ChatDTO getOrCreateDirectChat(String user1, String user2, Chat.ChatContext context) {
        Chat existingChat = chatRepository.findDirectChatBetweenUsers(user1, user2);
        if (existingChat != null) {
            // Update context if it's not set
            if (existingChat.getContext() == null && context != null) {
                existingChat.setContext(context);
                existingChat = chatRepository.save(existingChat);
            }
            return new ChatDTO(existingChat);
        }
        
        List<String> participants = List.of(user1, user2);
        String chatName = "Direct Chat";
        Chat chat = new Chat(chatName, Chat.ChatType.DIRECT, participants, context != null ? context : Chat.ChatContext.ONE_ON_ONE);
        chat = chatRepository.save(chat);
        return new ChatDTO(chat);
    }

    public MessageDTO sendMessage(Long chatId, String senderId, String content, Message.MessageType type) {
        Message message = new Message(chatId, senderId, content, type);
        message = messageRepository.save(message);
        
        // Update chat's last message time
        Chat chat = chatRepository.findById(chatId).orElseThrow();
        chat.setLastMessageAt(LocalDateTime.now());
        chatRepository.save(chat);
        
        MessageDTO messageDTO = new MessageDTO(message);
        
        // Publish WebSocket event to all chat participants
        ChatMessageEvent event = new ChatMessageEvent(messageDTO, chatId);
        webSocketService.sendChatMessage(chat.getParticipants(), chatId, event);
        
        return messageDTO;
    }

    public Page<MessageDTO> getChatMessages(Long chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
        return messages.map(MessageDTO::new);
    }
}