import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { chatAPI, Message, Chat, ChatContext } from "@/lib/api/chat";
import { roomsApi } from "@/lib/api/rooms";
import { ridesApi } from '@/features/travel/rides/api";
import { MessageIcon, UserIcon } from '@/shared/components/ui/Icons";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { ChatContextTag } from '@/shared/utils/chatContext";
import { userApi, User } from "@/lib/api/users";
import { firebaseChatService, FirebaseMessage, ChatPresence } from '@/features/messaging/chat/firebaseChat";

export default function Conversation() {
  const { chatId, name, listingId, ridePostId } = useLocalSearchParams<{ chatId: string; name: string; listingId?: string; ridePostId?: string }>();
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<Map<string, ChatPresence>>(new Map());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const currentUser = useAuthStore(state => state.user);
  const currentUserId = currentUser?.uid || 'unknown';

  // Determine context from URL params or chat info
  const getChatContext = (): ChatContext | undefined => {
    if (listingId) return 'ROOM';
    if (ridePostId) return 'RIDE';
    if (chatInfo?.context) return chatInfo.context;
    if (chatInfo?.type === 'GROUP') return 'GROUP';
    return 'ONE_ON_ONE';
  };

  const loadChatInfo = async () => {
    if (!chatId) return;
    try {
      const chats = await chatAPI.getUserChats();
      const chat = chats.find(c => c.id === parseInt(chatId));
      if (chat) {
        setChatInfo(chat);
        
        // Load user info for all participants
        const participantIds = chat.participants.filter(id => id !== currentUserId);
        if (participantIds.length > 0) {
          try {
            const allUsers = await userApi.getAllUsers();
            const map = new Map<string, User>();
            allUsers.forEach(user => {
              if (chat.participants.includes(user.firebaseUid)) {
                map.set(user.firebaseUid, user);
              }
            });
            setUserMap(map);
          } catch (error) {
            console.error('Failed to load user info:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chat info:', error);
    }
  };

  const getSenderInfo = (senderId: string) => {
    if (senderId === currentUserId) {
      return {
        name: currentUser?.displayName || 'You',
        photoUrl: currentUser?.photoURL,
        initials: (currentUser?.displayName || 'Y').charAt(0).toUpperCase()
      };
    }
    const user = userMap.get(senderId);
    if (user) {
      return {
        name: user.name,
        photoUrl: user.photoUrl,
        initials: user.name.charAt(0).toUpperCase()
      };
    }
    return {
      name: 'Unknown User',
      photoUrl: undefined,
      initials: 'U'
    };
  };

  const loadMessages = async (page = 0, append = false) => {
    if (!chatId) return;
    setErrorMessage(null);
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Load messages from backend with pagination
      const response = await chatAPI.getChatMessages(parseInt(chatId), page, 20);
      const newMessages = response.content.reverse(); // Reverse to show oldest first
      
      if (append) {
        // Prepend older messages
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        // Initial load
        setMessages(newMessages);
      }
      
      setHasMoreMessages(response.content.length === 20); // If we got a full page, there might be more
      setCurrentPage(page);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setErrorMessage('Unable to load messages right now.');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMoreMessages && chatId) {
      loadMessages(currentPage + 1, true);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || sending) return;

    setSending(true);
    setErrorMessage(null);
    try {
      // Send via Firebase Realtime Database (real-time delivery)
      await firebaseChatService.sendMessage(parseInt(chatId), newMessage.trim(), 'TEXT');
      setNewMessage('');
      scrollViewRef.current?.scrollToEnd({ animated: true });
      if (listingId) {
        await roomsApi.heartbeat(chatId);
      }
      if (ridePostId) {
        await ridesApi.heartbeat(chatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Unable to send message right now.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    // Initialize Firebase chat service
    firebaseChatService.initialize(currentUserId);

    loadChatInfo();
    loadMessages();

    // Subscribe to Firebase Realtime Database messages
    const unsubscribeMessages = firebaseChatService.subscribeToMessages(
      parseInt(chatId),
      (firebaseMessage: FirebaseMessage) => {
        // Convert Firebase message to Message format
        const message: Message = {
          id: parseInt(firebaseMessage.id || '0') || Date.now(),
          chatId: firebaseMessage.chatId,
          senderId: firebaseMessage.senderId,
          content: firebaseMessage.content,
          type: firebaseMessage.type,
          createdAt: new Date(firebaseMessage.createdAt).toISOString(),
        };

        // Check if message already exists (avoid duplicates)
        setMessages(prev => {
          const exists = prev.some(m => 
            m.id === message.id || 
            (m.senderId === message.senderId && 
             m.content === message.content && 
             Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
          );
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.error('Error in Firebase message listener:', error);
        setErrorMessage('Connection error. Messages may not update in real-time.');
      }
    );

    // Subscribe to online status for all participants
    const presenceUnsubscribes: (() => void)[] = [];
    if (chatInfo) {
      chatInfo.participants.forEach((participantId) => {
        if (participantId !== currentUserId) {
          const unsubscribe = firebaseChatService.subscribeToUserPresence(
            participantId,
            (presence) => {
              setOnlineStatus(prev => {
                const newMap = new Map(prev);
                newMap.set(participantId, presence);
                return newMap;
              });
            }
          );
          presenceUnsubscribes.push(unsubscribe);
        }
      });
    }

    return () => {
      unsubscribeMessages();
      presenceUnsubscribes.forEach(unsub => unsub());
    };
  }, [chatId, currentUserId, chatInfo]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-blue-600 dark:text-blue-400 text-lg font-bold">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            {chatInfo && chatInfo.type === 'DIRECT' && chatInfo.participants.length > 0 ? (
              (() => {
                const otherParticipantId = chatInfo.participants.find(p => p !== currentUserId);
                const otherUser = otherParticipantId ? userMap.get(otherParticipantId) : null;
                const displayName = otherUser?.name || decodeURIComponent(name || 'Chat');
                const displayImage = otherUser?.photoUrl;
                
                return (
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => {
                        const otherParticipantId = chatInfo.participants.find(p => p !== currentUserId);
                        if (otherParticipantId) {
                          router.push(`/user/${otherParticipantId}`);
                        }
                      }}
                      className="flex-row items-center flex-1"
                    >
                      {displayImage && (
                        <View className="w-8 h-8 rounded-full mr-2 overflow-hidden">
                          <Image 
                            source={{ uri: displayImage }} 
                            className="w-8 h-8 rounded-full"
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center flex-wrap">
                          <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-2">
                            {displayName}
                          </Text>
                          {otherParticipantId && (() => {
                            const presence = onlineStatus.get(otherParticipantId);
                            const isOnline = presence?.online === true;
                            return (
                              <View className="flex-row items-center mr-2">
                                <View className={`w-2 h-2 rounded-full mr-1 ${
                                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  {isOnline ? 'Online' : 'Offline'}
                                </Text>
                              </View>
                            );
                          })()}
                          <ChatContextTag context={getChatContext()} size="small" isDarkMode={isDarkMode} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })()
            ) : (
              <>
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-2">
                    {decodeURIComponent(name || chatInfo?.name || 'Chat')}
                  </Text>
                  <ChatContextTag context={getChatContext()} size="small" isDarkMode={isDarkMode} />
                </View>
                {chatInfo?.type === 'GROUP' && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {chatInfo.participants.length} participants
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        onContentSizeChange={() => {
          // Only auto-scroll to bottom on initial load or new messages (not when loading older messages)
          if (!loadingMore) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onScroll={(event) => {
          // Load more messages when user scrolls near the top
          const { contentOffset } = event.nativeEvent;
          if (contentOffset.y < 100 && hasMoreMessages && !loadingMore) {
            loadMoreMessages();
          }
        }}
        scrollEventThrottle={400}
      >
        {loadingMore && (
          <View className="py-4 items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">Loading older messages...</Text>
          </View>
        )}
        {errorMessage && (
          <View className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-3 mb-4">
            <Text className="text-red-600 dark:text-red-400 text-sm">{errorMessage}</Text>
          </View>
        )}
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MessageIcon size={48} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
            <Text className="text-gray-500 dark:text-gray-400 text-lg mt-4">No messages yet</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-2">Start the conversation!</Text>
          </View>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const senderInfo = getSenderInfo(message.senderId);
            
            return (
              <View
                key={message.id}
                className={`mb-4 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <TouchableOpacity
                    onPress={() => router.push(`/user/${message.senderId}`)}
                    className="mr-2 mt-1"
                  >
                    <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden">
                      {senderInfo.photoUrl ? (
                        <Image 
                          source={{ uri: senderInfo.photoUrl }} 
                          className="w-8 h-8 rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                          {senderInfo.initials}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <TouchableOpacity
                      onPress={() => router.push(`/user/${message.senderId}`)}
                      className="mb-1 px-1"
                    >
                      <Text className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        {senderInfo.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View className={`rounded-2xl px-4 py-3 ${
                    isOwn 
                      ? 'bg-blue-600' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Text className={`text-base ${
                      isOwn ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {message.content}
                    </Text>
                    <Text className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Message Input */}
      <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="flex-row items-center space-x-3">
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 text-base text-gray-900 dark:text-white"
            placeholder="Type a message..."
            placeholderTextColor={isDarkMode ? "#9CA3AF" : "#9CA3AF"}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              newMessage.trim() && !sending ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Text className="text-white text-lg font-bold">
              {sending ? '...' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
