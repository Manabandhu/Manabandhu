import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { chatAPI, Chat } from "@/lib/api/chat";
import { userApi } from "@/lib/api/users";
import { MessageIcon, SearchIcon, UserIcon } from "@/components/ui/Icons";

interface User {
  id: number;
  firebaseUid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  role?: string;
  photoUrl?: string;
  isActive: boolean;
}

export default function ChatIndex() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Messages</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
          <SearchIcon size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'chats' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('chats')}
          >
            <Text className={`text-center font-medium ${activeTab === 'chats' ? 'text-blue-600' : 'text-gray-600'}`}>
              Chats ({chats.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'users' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('users')}
          >
            <Text className={`text-center font-medium ${activeTab === 'users' ? 'text-blue-600' : 'text-gray-600'}`}>
              Users ({users.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'chats' ? (
          // Chats List
          <View className="px-4">
            {filteredChats.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <MessageIcon size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4">No chats yet</Text>
                <Text className="text-gray-400 text-sm mt-2">Start a conversation with someone!</Text>
              </View>
            ) : (
              filteredChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  className="flex-row items-center py-4 border-b border-gray-100"
                  onPress={() => openChat(chat)}
                >
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 font-semibold text-lg">
                      {chat.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">{chat.name}</Text>
                    {chat.lastMessage && (
                      <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                        {chat.lastMessage.content}
                      </Text>
                    )}
                  </View>
                  {chat.lastMessageAt && (
                    <Text className="text-gray-400 text-xs">
                      {formatTime(chat.lastMessageAt)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          // Users List
          <View className="px-4">
            {filteredUsers.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <UserIcon size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4">No users found</Text>
                <Text className="text-gray-400 text-sm mt-2">Try adjusting your search</Text>
              </View>
            ) : (
              filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  className="flex-row items-center py-4 border-b border-gray-100"
                  onPress={() => startDirectChat(user)}
                >
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-green-600 font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">{user.name}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{user.email || 'No email'}</Text>
                  </View>
                  <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
                    <MessageIcon size={16} color="white" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}