import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { communityAPI } from '@/lib/api/community';
import { UserIcon, SendIcon } from '@/shared/components/ui/Icons';
import { useThemeStore } from '@/store/theme.store';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

interface CommentsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  postTitle?: string;
}

export default function CommentsBottomSheet({ visible, onClose, postId, postTitle }: CommentsBottomSheetProps) {
  const { isDarkMode } = useThemeStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    if (!visible) return;
    
    setLoading(true);
    try {
      const response = await communityAPI.getPostComments(postId);
      setComments(response.content.map(c => ({
        id: c.id,
        content: c.content,
        authorName: c.authorName,
        createdAt: c.createdAt
      })));
    } catch (error) {
      console.error('Failed to load comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const comment = await communityAPI.addComment(postId, newComment.trim());
      
      setComments(prev => [{
        id: comment.id,
        content: comment.content,
        authorName: comment.authorName,
        createdAt: comment.createdAt
      }, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  useEffect(() => {
    loadComments();
  }, [visible, postId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={onClose}
        >
          <Pressable 
            className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-blue-600 dark:text-blue-400 text-lg">Close</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">Comments</Text>
              <View className="w-12" />
            </View>

            {/* Comments List */}
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
              {loading ? (
                <View className="py-8">
                  <Text className="text-gray-500 dark:text-gray-400 text-center">Loading comments...</Text>
                </View>
              ) : comments.length === 0 ? (
                <View className="py-8">
                  <Text className="text-gray-500 dark:text-gray-400 text-center">No comments yet</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1">Be the first to comment!</Text>
                </View>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mr-3 mt-1">
                        <UserIcon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="font-semibold text-gray-900 dark:text-white text-sm">
                            {comment.authorName}
                          </Text>
                          <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                            {formatTime(comment.createdAt)}
                          </Text>
                        </View>
                        <Text className="text-gray-800 dark:text-gray-200 text-sm leading-5">
                          {comment.content}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Add Comment Input */}
            <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Add a comment..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 max-h-20"
                  maxLength={500}
                />
                <TouchableOpacity 
                  onPress={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
                    submitting || !newComment.trim() ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600'
                  }`}
                >
                  <SendIcon size={16} color={submitting || !newComment.trim() ? (isDarkMode ? '#6B7280' : '#9CA3AF') : '#FFFFFF'} />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}