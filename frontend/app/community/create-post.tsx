import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { communityAPI } from "@/lib/api/community";

export default function CreateCommunityPost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setLoading(true);
    try {
      await communityAPI.createPost({ content: content.trim() });
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/community') }
      ]);
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Create Post
        </Text>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={loading || !content.trim()}
          className={`px-4 py-2 rounded-full ${
            loading || !content.trim() ? 'bg-gray-300' : 'bg-blue-600'
          }`}
        >
          <Text className={`font-semibold ${
            loading || !content.trim() ? 'text-gray-500' : 'text-white'
          }`}>
            {loading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base min-h-[200px]"
          maxLength={2000}
        />
        
        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-gray-500 text-sm">
            {content.length}/2000 characters
          </Text>
        </View>

        {/* Future: Add image upload, categories, etc. */}
        <View className="mt-6 p-4 bg-gray-50 rounded-xl">
          <Text className="text-gray-600 text-sm font-medium mb-2">Community Guidelines</Text>
          <Text className="text-gray-500 text-xs leading-5">
            • Be respectful and kind to others{"\n"}
            • No spam or self-promotion{"\n"}
            • Keep content relevant to the community{"\n"}
            • No hate speech or discrimination
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


