import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { communityAPI, CommunityPost } from "@/lib/api/community";
import { useAuthStore } from "@/store/auth.store";
import { MessageIcon, UserIcon } from "@/components/ui/Icons";
import CreatePostBottomSheet from "@/components/CreatePostBottomSheet";
import CommentsBottomSheet from "@/components/CommentsBottomSheet";

export default function CommunityFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = useAuthStore(state => state.user);
  const [showCreatePostSheet, setShowCreatePostSheet] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const loadPosts = async () => {
    try {
      const response = await communityAPI.getAllPosts(0, 20);
      setPosts(response.content);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: number) => {
    try {
      const updatedPost = await communityAPI.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleShowComments = (postId: number) => {
    setSelectedPostId(postId);
    setShowCommentsSheet(true);
  };

  const handleCloseComments = () => {
    setShowCommentsSheet(false);
    setSelectedPostId(null);
  };

  useEffect(() => {
    loadPosts();
  }, []);

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading posts...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900">
          Community
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => setShowCreatePostSheet(true)}
        >
          <Text className="text-white font-semibold">+ Post</Text>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <MessageIcon size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4">No posts yet</Text>
          <Text className="text-gray-400 text-sm mt-2">Be the first to share something!</Text>
        </View>
      ) : (
        posts.map((post) => (
          <View key={post.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            {/* Post Header */}
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                <UserIcon size={20} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {post.authorName || 'Anonymous'}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatTime(post.createdAt)}
                </Text>
              </View>
            </View>

            {/* Post Content */}
            <Text className="text-gray-900 text-base mb-4 leading-6">
              {post.content}
            </Text>

            {/* Post Actions */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => handleLike(post.id)}
              >
                <Text className="text-2xl mr-1">{post.isLiked ? '❤️' : '🤍'}</Text>
                <Text className="text-gray-600 font-medium">{post.likes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => handleShowComments(post.id)}
              >
                <MessageIcon size={18} color="#6B7280" />
                <Text className="text-gray-600 font-medium ml-1">{post.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text className="text-gray-500 text-sm">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <CreatePostBottomSheet 
        visible={showCreatePostSheet}
        onClose={() => setShowCreatePostSheet(false)}
        onPostCreated={loadPosts}
      />

      <CommentsBottomSheet 
        visible={showCommentsSheet}
        onClose={handleCloseComments}
        postId={selectedPostId || 0}
      />
    </ScrollView>
  );
}


