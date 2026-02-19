import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import Header from '@/shared/components/ui/Header';
import { communityAPI, CommunityPost } from '@/shared/api/community';
import { jobsAPI, Job } from '@/shared/api/jobs';
import { UserIcon, SettingsIcon, BriefcaseIcon, HomeIcon, MessageIcon, TrashIcon, EditIcon } from '@/shared/components/ui/Icons';
import PostJobBottomSheet from '@/components/PostJobBottomSheet';

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'posts' | 'jobs' | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: number; content: string } | null>(null);
  const [showPostJobSheet, setShowPostJobSheet] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadUserPosts();
      loadUserJobs();
    }
  }, [user?.uid]);

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await communityAPI.getUserPosts(user?.uid || '', 0, 5);
      setUserPosts(response.content);
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadUserJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await jobsAPI.getUserJobs(user?.uid || '', 0, 5);
      setUserJobs(response.content);
    } catch (error) {
      console.error('Failed to load user jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityAPI.deletePost(postId);
              setUserPosts(prev => prev.filter(post => post.id !== postId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const handleDeleteJob = async (jobId: number) => {
    console.log('Delete job clicked:', jobId);
    try {
      console.log('Deleting job:', jobId);
      await jobsAPI.deleteJob(jobId);
      console.log('Job deleted successfully');
      setUserJobs(prev => prev.filter(job => job.id !== jobId));
      Alert.alert('Success', 'Job deleted successfully');
    } catch (error) {
      console.error('Failed to delete job:', error);
      Alert.alert('Error', `Failed to delete job: ${error}`);
    }
  };

  const handleEditPost = (post: CommunityPost) => {
    setEditingPost({ id: post.id, content: post.content });
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      await communityAPI.updatePost(editingPost.id, { content: editingPost.content });
      setUserPosts(prev => prev.map(post => 
        post.id === editingPost.id ? { ...post, content: editingPost.content } : post
      ));
      setEditingPost(null);
      Alert.alert('Success', 'Post updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update post');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const profileStats = [
    { label: 'Posts', value: '12' },
    { label: 'Connections', value: '48' },
    { label: 'Reviews', value: '5' }
  ];

  const menuItems = [
    { icon: UserIcon, label: 'Edit Profile', route: '/profile/edit' },
    { icon: BriefcaseIcon, label: 'My Jobs', route: '/jobs' },
    { icon: HomeIcon, label: 'My Listings', route: '/rooms' },
    { icon: MessageIcon, label: 'Messages', route: '/chat' },
    { icon: SettingsIcon, label: 'Settings', route: '/profile/settings' },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Profile" showBack={false} />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-8">
        <View className="items-center">
          {/* Profile Picture */}
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <UserIcon size={40} color="#6B7280" />
            )}
          </View>
          
          {/* User Info */}
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {user?.displayName || 'User'}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-1">
            {user?.email}
          </Text>
          {user?.city && (
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              📍 {user.city}, {user.country}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row justify-around mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          {profileStats.map((stat, index) => (
            <View key={index} className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white dark:bg-gray-800 mt-4 mx-4 rounded-xl">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center px-4 py-4 ${
              index !== menuItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
            onPress={() => router.push(item.route as any)}
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3">
              <item.icon size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            </View>
            <Text className="flex-1 text-gray-900 dark:text-white font-medium">{item.label}</Text>
            <Text className="text-gray-400 dark:text-gray-500">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Jobs Section */}
      <View className="bg-white dark:bg-gray-800 mt-4 mx-4 rounded-xl">
        <TouchableOpacity 
          className="flex-row justify-between items-center px-4 py-4"
          onPress={() => setExpandedSection(expandedSection === 'jobs' ? null : 'jobs')}
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">My Jobs ({userJobs.length})</Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xl">{expandedSection === 'jobs' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'jobs' && (
          <View className="border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Manage your job postings</Text>
              <TouchableOpacity onPress={() => setShowPostJobSheet(true)}>
                <Text className="text-blue-600 font-medium text-sm">+ Post Job</Text>
              </TouchableOpacity>
            </View>
            
            {jobsLoading ? (
              <View className="px-4 py-8">
                <Text className="text-gray-500 text-center">Loading jobs...</Text>
              </View>
            ) : userJobs.length === 0 ? (
              <View className="px-4 py-8">
                <Text className="text-gray-500 text-center">No jobs posted yet</Text>
              </View>
            ) : (
              <View>
                {userJobs.map((job, index) => (
                  <View 
                    key={job.id} 
                    className={`px-4 py-4 ${
                      index !== userJobs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">{job.company} • {job.location}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteJob(job.id)}>
                        <TrashIcon size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-gray-700 text-sm" numberOfLines={2}>
                      {job.description}
                    </Text>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </Text>
                      <Text className="text-xs font-medium text-blue-600">
                        {job.type.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* My Posts Section */}
      <View className="bg-white dark:bg-gray-800 mt-4 mx-4 rounded-xl">
        <TouchableOpacity 
          className="flex-row justify-between items-center px-4 py-4"
          onPress={() => setExpandedSection(expandedSection === 'posts' ? null : 'posts')}
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">My Posts ({userPosts.length})</Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xl">{expandedSection === 'posts' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'posts' && (
          <View className="border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Manage your community posts</Text>
              <TouchableOpacity onPress={() => router.push('/community/create-post')}>
                <Text className="text-blue-600 font-medium text-sm">+ New Post</Text>
              </TouchableOpacity>
            </View>
            
            {postsLoading ? (
              <View className="px-4 py-8">
                <Text className="text-gray-500 text-center">Loading posts...</Text>
              </View>
            ) : userPosts.length === 0 ? (
              <View className="px-4 py-8">
                <Text className="text-gray-500 text-center">No posts yet</Text>
              </View>
            ) : (
              <View>
                {userPosts.map((post, index) => (
                  <View 
                    key={post.id} 
                    className={`px-4 py-4 ${
                      index !== userPosts.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    {editingPost?.id === post.id ? (
                      <View>
                        <TextInput
                          value={editingPost.content}
                          onChangeText={(text) => setEditingPost({...editingPost, content: text})}
                          multiline
                          className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 mb-3"
                        />
                        <View className="flex-row gap-2">
                          <TouchableOpacity 
                            onPress={handleUpdatePost}
                            className="bg-blue-600 px-3 py-2 rounded-lg"
                          >
                            <Text className="text-white text-sm font-medium">Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => setEditingPost(null)}
                            className="bg-gray-300 px-3 py-2 rounded-lg"
                          >
                            <Text className="text-gray-700 text-sm font-medium">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                          <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => handleEditPost(post)}>
                              <EditIcon size={16} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeletePost(post.id)}>
                              <TrashIcon size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text className="text-gray-900 leading-5" numberOfLines={3}>
                          {post.content}
                        </Text>
                        <View className="flex-row justify-between items-center mt-2">
                          <Text className="text-xs text-gray-500">
                            {post.likes} likes • {post.comments} comments
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* About Section */}
      <View className="bg-white dark:bg-gray-800 mt-4 mx-4 rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</Text>
        <Text className="text-gray-600 dark:text-gray-400 leading-6">
          Welcome to ManaBandhu! Connect with fellow immigrants, find housing, jobs, and build your community.
        </Text>
      </View>

      {/* Sign Out */}
      <View className="mt-6 mx-4 mb-8">
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-xl py-4"
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text className="text-red-600 text-center font-semibold">
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>

      <PostJobBottomSheet 
        visible={showPostJobSheet}
        onClose={() => setShowPostJobSheet(false)}
        onJobPosted={loadUserJobs}
      />
      </ScrollView>
    </View>
  );
}