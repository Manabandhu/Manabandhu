import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image } from "react-native";
import { useRouter } from "expo-router";
import Header from '@/shared/components/ui/Header";
import { chatAPI, Chat } from "@/lib/api/chat";
import { useThemeStore } from "@/store/theme.store";
import { ChatContextTag } from '@/shared/utils/chatContext";
import { userApi, User } from "@/lib/api/users";
import { useAuthStore } from "@/store/auth.store";
import { SearchIcon, XIcon } from '@/shared/components/ui/Icons";

export default function ChatList() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const currentUser = useAuthStore(state => state.user);
  const [chats, setChats] = useState<Chat[]>([]);
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = async () => {
    try {
      const [userChats, allUsers] = await Promise.all([
        chatAPI.getUserChats(),
        userApi.getAllUsers()
      ]);
      setChats(userChats);
      
      // Create a map of firebaseUid -> User for quick lookup
      const map = new Map<string, User>();
      allUsers.forEach(user => {
        map.set(user.firebaseUid, user);
      });
      setUserMap(map);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the other participant's info for direct chats
  const getChatParticipantInfo = (chat: Chat): User | null => {
    if (chat.type === 'GROUP') return null;
    const otherParticipantId = chat.participants.find(p => p !== currentUser?.uid);
    if (!otherParticipantId) return null;
    return userMap.get(otherParticipantId) || null;
  };

  // Get display name and image for chat
  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.type === 'GROUP') {
      return {
        name: chat.name,
        image: null,
        initials: chat.name.charAt(0).toUpperCase()
      };
    }
    const participant = getChatParticipantInfo(chat);
    if (participant) {
      return {
        name: participant.name,
        image: participant.photoUrl,
        initials: participant.name.charAt(0).toUpperCase()
      };
    }
    return {
      name: chat.name,
      image: null,
      initials: chat.name.charAt(0).toUpperCase()
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => {
      const displayInfo = getChatDisplayInfo(chat);
      return displayInfo.name.toLowerCase().includes(query) ||
        (chat.lastMessage?.content.toLowerCase().includes(query));
    });
  }, [chats, searchQuery, userMap, currentUser]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Chat" />
      
      {/* Search Bar */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex-row items-center border border-gray-200 dark:border-gray-600">
          <SearchIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <XIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {filteredChats.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? "No chats found" : "No chats yet"}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {searchQuery ? "Try adjusting your search" : "Start a conversation!"}
          </Text>
        </View>
      ) : (
        filteredChats.map((chat) => {
          const displayInfo = getChatDisplayInfo(chat);
          return (
            <TouchableOpacity
              key={chat.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center"
              onPress={() => router.push(`/chat/conversation?chatId=${chat.id}&name=${encodeURIComponent(displayInfo.name)}`)}
            >
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  if (chat.type === 'DIRECT') {
                    const otherParticipantId = chat.participants.find(p => p !== currentUser?.uid);
                    if (otherParticipantId) {
                      router.push(`/user/${otherParticipantId}`);
                    }
                  }
                }}
                className="mr-3"
              >
                <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center overflow-hidden">
                  {displayInfo.image ? (
                    <Image 
                      source={{ uri: displayInfo.image }} 
                      className="w-12 h-12 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-base">
                      {displayInfo.initials}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <View className="flex-1">
                <View className="flex-row items-center mb-1 flex-wrap">
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (chat.type === 'DIRECT') {
                        const otherParticipantId = chat.participants.find(p => p !== currentUser?.uid);
                        if (otherParticipantId) {
                          router.push(`/user/${otherParticipantId}`);
                        }
                      }
                    }}
                  >
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-2">
                      {displayInfo.name}
                    </Text>
                  </TouchableOpacity>
                  <ChatContextTag context={chat.context} size="small" isDarkMode={isDarkMode} />
                </View>
                {chat.lastMessage && (
                  <Text className="text-gray-600 dark:text-gray-400 text-sm" numberOfLines={1}>
                    {chat.lastMessage.content}
                  </Text>
                )}
              </View>
              <View className="items-end ml-2">
                <Text className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  {formatTime(chat.lastMessageAt)}
                </Text>
                {chat.type === 'GROUP' && (
                  <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    <Text className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Group</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })
      )}
      </ScrollView>
    </View>
  );
}




