import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Question, QuestionsFilter } from '@/types/qa';
import { QuestionCard } from '@/components/qa/QuestionCard';
import { qaApi } from '@/lib/api/qa';
import { toast } from '@/lib/toast';
import { COLORS } from '@/constants/colors';
import { SearchIcon, PlusIcon, FilterIcon, XIcon } from '@/components/ui/Icons';
import Header from '@/components/ui/Header';
import { useThemeStore } from '@/store/theme.store';

export default function QaHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'RECENT' | 'VIEWS'>('RECENT');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = async (page: number = 0, append: boolean = false) => {
    try {
      if (page === 0) {
        setError(null);
      }
      
      const filter: QuestionsFilter = {
        sortBy,
        status: activeTab === 'unanswered' ? 'OPEN' : undefined,
        search: searchQuery.trim() || undefined,
        page,
        size: 20,
      };

      const response = await qaApi.getQuestions(filter);
      
      if (append) {
        setQuestions(prev => [...prev, ...response.content]);
      } else {
        setQuestions(response.content);
      }
      
      setHasMore(response.content.length === 20 && page < response.totalPages - 1);
      setCurrentPage(page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load questions';
      setError(errorMessage);
      if (page === 0) {
        toast.showError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    loadQuestions(0, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadQuestions(currentPage + 1, true);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setCurrentPage(0);
    setHasMore(true);
    loadQuestions(0, false);
  };

  const handleTabChange = (tab: 'all' | 'unanswered' | 'my') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setLoading(true);
      setCurrentPage(0);
      setHasMore(true);
    }
  };

  const handleSortChange = (sort: 'RECENT' | 'VIEWS') => {
    if (sort !== sortBy) {
      setSortBy(sort);
      setLoading(true);
      setCurrentPage(0);
      setHasMore(true);
    }
  };

  const handleAskQuestion = () => {
    router.push('/qa/ask');
  };

  // Load questions when tab or sort changes
  useEffect(() => {
    loadQuestions(0, false);
  }, [activeTab, sortBy]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [])
  );

  const tabs = [
    { key: 'all', label: 'All Questions' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'my', label: 'My Questions' },
  ];

  const renderHeader = () => (
    <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <Header title="Q&A" />
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row items-center justify-end mb-4">
          <TouchableOpacity
            onPress={handleAskQuestion}
            className="bg-indigo-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
          >
            <PlusIcon size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Ask</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200 dark:border-gray-600">
          <SearchIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search questions..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <XIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabChange(tab.key as any)}
              className={`px-4 py-2.5 rounded-full flex-1 ${
                activeTab === tab.key 
                  ? "bg-indigo-600 shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Text className={`font-semibold text-sm text-center ${
                activeTab === tab.key ? "text-white" : "text-gray-700 dark:text-gray-300"
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </Text>
          <TouchableOpacity
            onPress={() => setSortBy(sortBy === 'RECENT' ? 'VIEWS' : 'RECENT')}
            className="flex-row items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
          >
            <FilterIcon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2 font-medium">
              Sort: {sortBy === 'RECENT' ? 'Recent' : 'Most Viewed'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="flex-row justify-center items-center py-4">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">Loading more questions...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-gray-500 dark:text-gray-400 text-base mt-4">Loading questions...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <View className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
            <Text className="text-red-600 dark:text-red-400 text-base text-center mb-4">Failed to load questions</Text>
            <TouchableOpacity 
              className="bg-red-600 dark:bg-red-500 px-6 py-3 rounded-xl"
              onPress={handleRefresh}
            >
              <Text className="text-white font-semibold text-center">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-20 px-4">
        <View className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-6 mb-4">
          <SearchIcon size={48} color="#4F46E5" />
        </View>
        <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-4">
          {searchQuery ? 'No questions found' : 'No questions yet'}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
          {searchQuery 
            ? 'Try adjusting your search'
            : 'Be the first to ask a question!'}
        </Text>
        {!searchQuery && (
          <TouchableOpacity 
            className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-md"
            onPress={handleAskQuestion}
          >
            <Text className="text-white font-semibold">Ask the first question</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6">
            <QuestionCard question={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={questions.length === 0 ? { flexGrow: 1 } : { paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
