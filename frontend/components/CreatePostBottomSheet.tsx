import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { communityAPI } from '@/lib/api/community';

interface CreatePostBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CreatePostBottomSheet({ visible, onClose, onPostCreated }: CreatePostBottomSheetProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setContent('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setLoading(true);
    try {
      await communityAPI.createPost({ content: content.trim() });
      resetForm();
      onClose();
      onPostCreated?.();
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={handleClose}
        >
          <Pressable 
            className="bg-white rounded-t-3xl max-h-[85%]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-blue-600 text-lg">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Create Post</Text>
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

            {/* Form */}
            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="What's on your mind?"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base min-h-[150px]"
                maxLength={2000}
              />
              
              <View className="flex-row justify-between items-center mt-4">
                <Text className="text-gray-500 text-sm">
                  {content.length}/2000 characters
                </Text>
              </View>

              <View className="mt-6 p-4 bg-gray-50 rounded-xl mb-6">
                <Text className="text-gray-600 text-sm font-medium mb-2">Community Guidelines</Text>
                <Text className="text-gray-500 text-xs leading-5">
                  • Be respectful and kind to others{'\n'}
                  • No spam or self-promotion{'\n'}
                  • Keep content relevant to the community{'\n'}
                  • No hate speech or discrimination
                </Text>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}