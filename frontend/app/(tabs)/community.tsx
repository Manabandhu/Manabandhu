import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { communityAPI, CommunityPost } from "@/lib/api/community";
import { useAuthStore } from "@/store/auth.store";
import { MessageIcon, UserIcon, PlusIcon, SearchIcon, XIcon, HeartIcon } from "@/components/ui/Icons";
import CreatePostBottomSheet from "@/components/CreatePostBottomSheet";
import CommentsBottomSheet from "@/components/CommentsBottomSheet";

export default function CommunityFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter posts by search
  const filteredPosts = posts.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">Community</Text>
              <Text className="text-sm text-gray-500 mt-1">Connect and share with others</Text>
            </View>
            <TouchableOpacity
              className="bg-blue-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
              onPress={() => setShowCreatePostSheet(true)}
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Post</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center border border-gray-200">
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search posts..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-900"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XIcon size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-sm text-gray-600 mt-3">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          </Text>
        </View>
      </View>

      {/* Posts List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && (
          <View className="items-center py-20">
            <Text className="text-gray-500 text-base">Loading posts...</Text>
          </View>
        )}

        {!loading && filteredPosts.length === 0 && (
          <View className="items-center py-20 px-4">
            <View className="bg-blue-100 rounded-full p-6 mb-4">
              <MessageIcon size={48} color="#3B82F6" />
            </View>
            <Text className="text-gray-700 text-xl font-semibold mt-4">
              {searchQuery ? "No posts found" : "No posts yet"}
            </Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">
              {searchQuery 
                ? "Try adjusting your search"
                : "Be the first to share something with the community!"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={() => setShowCreatePostSheet(true)}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-xl shadow-md"
              >
                <Text className="text-white font-semibold">+ Create Post</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!loading && filteredPosts.map((post) => (
          <View key={post.id} className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-100">
            {/* Post Header */}
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                <UserIcon size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">
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
                className="flex-row items-center bg-red-50 px-4 py-2 rounded-lg"
                onPress={() => handleLike(post.id)}
                activeOpacity={0.7}
              >
                <HeartIcon size={18} color={post.isLiked ? "#EF4444" : "#9CA3AF"} />
                <Text className={`font-semibold ml-2 ${
                  post.isLiked ? "text-red-600" : "text-gray-600"
                }`}>
                  {post.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                onPress={() => handleShowComments(post.id)}
                activeOpacity={0.7}
              >
                <MessageIcon size={18} color="#3B82F6" />
                <Text className="text-blue-600 font-semibold ml-2">{post.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-gray-600 text-sm font-medium">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

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
    </SafeAreaView>
  );
}
