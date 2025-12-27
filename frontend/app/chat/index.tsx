import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chatAPI, Chat } from "@/lib/api/chat";
import { userApi } from "@/lib/api/users";
import { MessageIcon, SearchIcon, UserIcon, XIcon, PlusIcon } from "@/components/ui/Icons";

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
  const insets = useSafeAreaInsets();
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
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">Messages</Text>
              <Text className="text-sm text-gray-500 mt-1">Chat with your community</Text>
            </View>
          </View>
          
          {/* Search Bar */}
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200">
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
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
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg ${activeTab === 'chats' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setActiveTab('chats')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'chats' ? 'text-blue-600' : 'text-gray-600'}`}>
                Chats ({chats.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg ${activeTab === 'users' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setActiveTab('users')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'users' ? 'text-blue-600' : 'text-gray-600'}`}>
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
              filteredChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-100 flex-row items-center"
                  onPress={() => openChat(chat)}
                  activeOpacity={0.7}
                >
                  <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-blue-600 font-bold text-lg">
                      {chat.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base mb-1">{chat.name}</Text>
                    {chat.lastMessage && (
                      <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        {chat.lastMessage.content}
                      </Text>
                    )}
                  </View>
                  {chat.lastMessageAt && (
                    <Text className="text-gray-400 text-xs ml-2">
                      {formatTime(chat.lastMessageAt)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
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
                  className="bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-100 flex-row items-center"
                  onPress={() => startDirectChat(user)}
                  activeOpacity={0.7}
                >
                  <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-green-600 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base mb-1">{user.name}</Text>
                    <Text className="text-gray-500 text-sm">{user.email || 'No email'}</Text>
                  </View>
                  <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                    <MessageIcon size={18} color="white" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
