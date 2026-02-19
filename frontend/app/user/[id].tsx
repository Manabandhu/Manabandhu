import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { userApi, User } from "@/lib/api/users";
import { useThemeStore } from "@/store/theme.store";
import { UserIcon, MessageIcon, MapPinIcon } from '@/shared/components/ui/Icons";
import Header from '@/shared/components/ui/Header";
import { chatAPI } from "@/lib/api/chat";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const allUsers = await userApi.getAllUsers();
      const foundUser = allUsers.find(u => u.firebaseUid === id || u.id.toString() === id);
      if (foundUser) {
        setUser(foundUser);
      } else {
        setError("User not found");
      }
    } catch (err) {
      setError("Failed to load user profile");
      console.error("Error loading user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    if (!user) return;
    try {
      const chat = await chatAPI.getOrCreateDirectChat(user.firebaseUid);
      router.push(`/chat/conversation?chatId=${chat.id}&name=${encodeURIComponent(user.name)}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color={isDarkMode ? "#3B82F6" : "#2563EB"} />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Header title="User Profile" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">{error || "User not found"}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Profile" />
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-8">
          <View className="items-center">
            {/* Profile Picture */}
            <View className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4 overflow-hidden">
              {user.photoUrl ? (
                <Image 
                  source={{ uri: user.photoUrl }} 
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <UserIcon size={48} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              )}
            </View>
            
            {/* User Name */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {user.name}
            </Text>

            {/* Email */}
            {user.email && (
              <Text className="text-gray-600 dark:text-gray-400 mb-2">
                {user.email}
              </Text>
            )}

            {/* Location */}
            {(user.city || user.country) && (
              <View className="flex-row items-center mb-4">
                <MapPinIcon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                  {[user.city, user.country].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}

            {/* Role */}
            {user.role && (
              <View className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
                <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {user.role}
                </Text>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              onPress={startChat}
              className="bg-blue-600 dark:bg-blue-500 px-8 py-3 rounded-full flex-row items-center mt-2"
            >
              <MessageIcon size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Info Section */}
        <View className="bg-white dark:bg-gray-800 mt-4 px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </Text>

          {/* Phone Number */}
          {user.phoneNumber && (
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <Text className="text-gray-600 dark:text-gray-400 flex-1">Phone</Text>
              <Text className="text-gray-900 dark:text-white font-medium">{user.phoneNumber}</Text>
            </View>
          )}

          {/* Status */}
          <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-gray-600 dark:text-gray-400 flex-1">Status</Text>
            <View className={`px-3 py-1 rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Text className={`text-sm font-semibold ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Currency */}
          {user.currency && (
            <View className="flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400 flex-1">Currency</Text>
              <Text className="text-gray-900 dark:text-white font-medium">{user.currency}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


