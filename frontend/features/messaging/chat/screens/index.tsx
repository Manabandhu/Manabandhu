import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { chatAPI, Chat } from "@/lib/api/chat";
import { userApi, User } from "@/lib/api/users";
import { MessageIcon, SearchIcon, UserIcon, XIcon, PlusIcon } from '@/shared/components/ui/Icons";
import { ChatContextTag } from '@/shared/utils/chatContext";
import { useThemeStore } from "@/store/theme.store";
import { useAuthStore } from "@/store/auth.store";

export default function ChatIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const currentUser = useAuthStore(state => state.user);
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');

  const loadData = async () => {
    try {
      const [chatsResponse, usersResponse] = await Promise.all([
        chatAPI.getUserChats(),
        userApi.getAllUsers()
      ]);
      setChats(chatsResponse);
      setUsers(usersResponse);
      
      // Create a map of firebaseUid -> User for quick lookup
      const map = new Map<string, User>();
      usersResponse.forEach(user => {
        map.set(user.firebaseUid, user);
      });
      setUserMap(map);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const startDirectChat = async (user: User) => {
    try {
      const chat = await chatAPI.getOrCreateDirectChat(user.firebaseUid);
      router.push(`/chat/conversation?chatId=${chat.id}&name=${encodeURIComponent(user.name)}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const openChat = (chat: Chat) => {
    router.push(`/chat/conversation?chatId=${chat.id}&name=${encodeURIComponent(chat.name)}`);
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

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">Messages</Text>
              <Text className="text-sm text-gray-500 mt-1">Chat with your community</Text>
            </View>
          </View>
          
          {/* Search Bar */}
          <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200 dark:border-gray-600">
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 dark:text-white"
              placeholder="Search chats or users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XIcon size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg ${activeTab === 'chats' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              onPress={() => setActiveTab('chats')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'chats' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Chats ({chats.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg ${activeTab === 'users' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              onPress={() => setActiveTab('users')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'users' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Users ({users.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'chats' ? (
          // Chats List
          <>
            {filteredChats.length === 0 ? (
              <View className="items-center py-20 px-4">
                <View className="bg-blue-100 rounded-full p-6 mb-4">
                  <MessageIcon size={48} color="#3B82F6" />
                </View>
                <Text className="text-gray-700 text-xl font-semibold mt-4">
                  {searchQuery ? "No chats found" : "No chats yet"}
                </Text>
                <Text className="text-gray-500 mt-2 text-center text-sm">
                  {searchQuery 
                    ? "Try adjusting your search"
                    : "Start a conversation with someone!"}
                </Text>
              </View>
            ) : (
              filteredChats.map((chat) => {
                const displayInfo = getChatDisplayInfo(chat);
                return (
                  <TouchableOpacity
                    key={chat.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-md border border-gray-100 dark:border-gray-700 flex-row items-center"
                    onPress={() => openChat(chat)}
                    activeOpacity={0.7}
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
                      className="mr-4"
                    >
                      <View className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center overflow-hidden">
                        {displayInfo.image ? (
                          <Image 
                            source={{ uri: displayInfo.image }} 
                            className="w-14 h-14 rounded-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Text className="text-blue-600 dark:text-blue-400 font-bold text-lg">
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
                          <Text className="text-gray-900 dark:text-white font-bold text-base mr-2">{displayInfo.name}</Text>
                        </TouchableOpacity>
                        <ChatContextTag context={chat.context} size="small" isDarkMode={isDarkMode} />
                      </View>
                      {chat.lastMessage && (
                        <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>
                          {chat.lastMessage.content}
                        </Text>
                      )}
                    </View>
                    <View className="items-end">
                      {chat.lastMessageAt && (
                        <Text className="text-gray-400 dark:text-gray-500 text-xs mb-1">
                          {formatTime(chat.lastMessageAt)}
                        </Text>
                      )}
                      {chat.type === 'GROUP' && (
                        <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full mt-1">
                          <Text className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Group</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : (
          // Users List
          <>
            {filteredUsers.length === 0 ? (
              <View className="items-center py-20 px-4">
                <View className="bg-green-100 rounded-full p-6 mb-4">
                  <UserIcon size={48} color="#10B981" />
                </View>
                <Text className="text-gray-700 text-xl font-semibold mt-4">
                  {searchQuery ? "No users found" : "No users available"}
                </Text>
                <Text className="text-gray-500 mt-2 text-center text-sm">
                  {searchQuery 
                    ? "Try adjusting your search"
                    : "No other users in the community yet"}
                </Text>
              </View>
            ) : (
              filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-md border border-gray-100 dark:border-gray-700 flex-row items-center"
                  onPress={() => router.push(`/user/${user.firebaseUid}`)}
                  activeOpacity={0.7}
                >
                  <View className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4 overflow-hidden">
                    {user.photoUrl ? (
                      <Image 
                        source={{ uri: user.photoUrl }} 
                        className="w-14 h-14 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-bold text-base mb-1">{user.name}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">{user.email || 'No email'}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      startDirectChat(user);
                    }}
                    className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center"
                  >
                    <MessageIcon size={18} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
