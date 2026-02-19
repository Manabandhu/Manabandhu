package com.manabandhu.shared.utils;

import com.manabandhu.dto.ChatDTO;
import com.manabandhu.dto.MessageDTO;
import com.manabandhu.modules.messaging.shared.dto.ChatMessageEvent;
import com.manabandhu.model.User;
import com.manabandhu.modules.messaging.chat.components.model.Chat;
import com.manabandhu.modules.messaging.chat.components.model.Message;
import com.manabandhu.repository.ChatRepository;
import com.manabandhu.repository.MessageRepository;
import com.manabandhu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private UserRepository userRepository;

    public List<ChatDTO> getUserChats(String userId) {
        List<Chat> chats = chatRepository.findByParticipantsContaining(userId);
        
        // Efficiently load last message for each chat to avoid N+1 queries
        List<Long> chatIds = chats.stream().map(Chat::getId).collect(Collectors.toList());
        Map<Long, Message> lastMessagesMap = new HashMap<>();
        
        if (!chatIds.isEmpty()) {
            // Fetch the most recent message for each chat in a single query
            List<Message> lastMessages = messageRepository.findLastMessageByChatIds(chatIds);
            lastMessagesMap = lastMessages.stream()
                    .collect(Collectors.toMap(Message::getChatId, m -> m, (m1, m2) -> 
                        m1.getCreatedAt().isAfter(m2.getCreatedAt()) ? m1 : m2));
        }
        
        // Build ChatDTOs with last messages
        final Map<Long, Message> finalLastMessagesMap = lastMessagesMap;
        return chats.stream().map(chat -> {
            ChatDTO dto = new ChatDTO(chat);
            Message lastMessage = finalLastMessagesMap.get(chat.getId());
            if (lastMessage != null) {
                dto.setLastMessage(new MessageDTO(lastMessage));
            }
            return dto;
        }).collect(Collectors.toList());
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
        // Optimize: Fetch chat first, then save message and update chat in single transaction
        Chat chat = chatRepository.findById(chatId).orElseThrow();
        
        Message message = new Message(chatId, senderId, content, type);
        message = messageRepository.save(message);
        
        // Update chat's last message time (already have chat object, no need for second query)
        chat.setLastMessageAt(LocalDateTime.now());
        chatRepository.save(chat);
        
        MessageDTO messageDTO = new MessageDTO(message);
        
        // Publish WebSocket event to all chat participants (for backward compatibility)
        ChatMessageEvent event = new ChatMessageEvent(messageDTO, chatId);
        webSocketService.sendChatMessage(chat.getParticipants(), chatId, event);
        
        // Send WhatsApp-like push notifications to all participants except sender
        sendChatPushNotifications(chat, senderId, content, messageDTO);
        
        return messageDTO;
    }

    /**
     * Send WhatsApp-like push notifications for chat messages
     */
    private void sendChatPushNotifications(Chat chat, String senderId, String content, MessageDTO messageDTO) {
        try {
            // Get sender's name
            Optional<User> senderOpt = userRepository.findByFirebaseUid(senderId);
            String senderName = senderOpt.map(User::getName).orElse("Someone");
            
            // Get recipient user IDs (all participants except sender)
            List<String> recipientIds = chat.getParticipants().stream()
                    .filter(participantId -> !participantId.equals(senderId))
                    .collect(Collectors.toList());
            
            if (recipientIds.isEmpty()) {
                return; // No recipients to notify
            }
            
            // Format notification based on chat type
            String title;
            String body;
            
            if (chat.getType() == Chat.ChatType.DIRECT) {
                // Direct chat: Just show the message
                title = senderName;
                body = content.length() > 100 ? content.substring(0, 100) + "..." : content;
            } else {
                // Group chat: Show sender name + message
                title = chat.getName();
                body = senderName + ": " + (content.length() > 80 ? content.substring(0, 80) + "..." : content);
            }
            
            // Prepare notification data
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("type", "CHAT_MESSAGE");
            notificationData.put("chatId", chat.getId().toString());
            notificationData.put("messageId", messageDTO.getId().toString());
            notificationData.put("senderId", senderId);
            notificationData.put("senderName", senderName);
            notificationData.put("content", content);
            notificationData.put("messageType", messageDTO.getType().toString());
            
            // Send push notifications to all recipients
            pushNotificationService.sendPushNotificationsToUsers(recipientIds, title, body, notificationData);
            
        } catch (Exception e) {
            // Log error but don't fail message sending
            System.err.println("Error sending chat push notifications: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public Page<MessageDTO> getChatMessages(Long chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
        return messages.map(MessageDTO::new);
    }
}