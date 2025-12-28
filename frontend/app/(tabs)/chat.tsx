import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/ui/Header";
import { chatAPI, Chat } from "@/lib/api/chat";

export default function ChatList() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = async () => {
    try {
      const userChats = await chatAPI.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header title="Chat" />
      <ScrollView 
        className="flex-1 px-4 py-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {chats.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 text-lg">No chats yet</Text>
          <Text className="text-gray-400 text-sm mt-2">Start a conversation!</Text>
        </View>
      ) : (
        chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => router.push(`/chat/conversation?chatId=${chat.id}&name=${encodeURIComponent(chat.name)}`)}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {chat.name}
                </Text>
                {chat.lastMessage && (
                  <Text className="text-gray-600 text-sm" numberOfLines={1}>
                    {chat.lastMessage.content}
                  </Text>
                )}
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-400">
                  {formatTime(chat.lastMessageAt)}
                </Text>
                {chat.type === 'GROUP' && (
                  <View className="bg-blue-100 px-2 py-1 rounded-full mt-1">
                    <Text className="text-xs text-blue-600">Group</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
      </ScrollView>
    </View>
  );
}




