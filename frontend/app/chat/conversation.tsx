import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { chatAPI, Message } from "@/lib/api/chat";
import { roomsApi } from "@/lib/api/rooms";
import { ridesApi } from "@/lib/api/rides";
import { MessageIcon } from "@/components/ui/Icons";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";

export default function Conversation() {
  const { chatId, name, listingId, ridePostId } = useLocalSearchParams<{ chatId: string; name: string; listingId?: string; ridePostId?: string }>();
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  
  const currentUserId = useAuthStore.getState().user?.uid || 'unknown';

  const loadMessages = async () => {
    if (!chatId) return;
    setErrorMessage(null);
    try {
      const response = await chatAPI.getChatMessages(parseInt(chatId));
      setMessages(response.content.reverse());
    } catch (error) {
      setErrorMessage('Unable to load messages right now.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || sending) return;

    setSending(true);
    setErrorMessage(null);
    try {
      const message = await chatAPI.sendMessage(parseInt(chatId), {
        content: newMessage.trim(),
        type: 'TEXT'
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollViewRef.current?.scrollToEnd({ animated: true });
      if (listingId) {
        await roomsApi.heartbeat(chatId);
      }
      if (ridePostId) {
        await ridesApi.heartbeat(chatId);
      }
    } catch (error) {
      setErrorMessage('Unable to send message right now.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  const formatTime = (dateString: string) => {
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
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 dark:text-blue-400 text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          {decodeURIComponent(name || 'Chat')}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
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
            return (
              <View
                key={message.id}
                className={`mb-4 ${isOwn ? 'items-end' : 'items-start'}`}
              >
                <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${
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
                    {formatTime(message.createdAt)}
                  </Text>
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
