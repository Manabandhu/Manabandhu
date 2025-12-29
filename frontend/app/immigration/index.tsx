import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import { immigrationNewsApi, NewsArticle, NewsFilters } from '@/lib/api/immigration';
import { IMPACT_LEVEL_COLORS, SOURCE_TYPE_LABELS } from '@/types/immigration';
import { SearchIcon, BookmarkIcon, XIcon, CalendarIcon, GlobeIcon } from '@/components/ui/Icons';
import { useThemeStore } from '@/store/theme.store';

export default function ImmigrationNewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<NewsFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNews();
  }, [activeTab, filters]);

  const loadNews = async () => {
    try {
      const tabFilters = getTabFilters(activeTab);
      const response = await immigrationNewsApi.getNews({ ...filters, ...tabFilters });
      setArticles(response.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const getTabFilters = (tab: string): NewsFilters => {
    switch (tab) {
      case 'breaking':
        return { isBreaking: true };
      case 'students':
        return { visaCategory: 'F1' };
      case 'work':
        return { visaCategory: 'H1B' };
      case 'greencard':
        return { visaCategory: 'Green Card' };
      default:
        return {};
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = articles.length;
    const breaking = articles.filter(a => a.isBreaking).length;
    const verified = articles.filter(a => a.isVerified).length;
    const bookmarked = articles.filter(a => a.isBookmarked).length;
    
    return { total, breaking, verified, bookmarked };
  }, [articles]);

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(article =>
      article.title?.toLowerCase().includes(query) ||
      article.summary?.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  const getImpactColor = (level: string) => {
    return IMPACT_LEVEL_COLORS[level as keyof typeof IMPACT_LEVEL_COLORS] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const toggleBookmark = async (article: NewsArticle) => {
    try {
      if (article.isBookmarked) {
        await immigrationNewsApi.removeBookmark(article.id);
      } else {
        await immigrationNewsApi.bookmarkArticle(article.id);
      }
      
      setArticles(prev => prev.map(a => 
        a.id === article.id ? { ...a, isBookmarked: !a.isBookmarked } : a
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'breaking', label: 'Breaking' },
    { id: 'students', label: 'Students' },
    { id: 'work', label: 'Work Visas' },
    { id: 'greencard', label: 'Green Card' },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 dark:text-gray-400 text-base">Loading news...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Immigration" />
      
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center justify-end mb-4">
            <TouchableOpacity 
              onPress={() => router.push('/immigration/bookmarks')}
              className="bg-indigo-50 px-4 py-3 rounded-xl"
            >
              <BookmarkIcon size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              <View className="bg-blue-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#3B82F6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Articles</Text>
                <Text className="text-white text-3xl font-bold">{stats.total}</Text>
              </View>
              <View className="bg-red-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#EF4444" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Breaking</Text>
                <Text className="text-white text-3xl font-bold">{stats.breaking}</Text>
              </View>
              <View className="bg-green-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#10B981" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Verified</Text>
                <Text className="text-white text-3xl font-bold">{stats.verified}</Text>
              </View>
              <View className="bg-purple-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#8B5CF6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Bookmarked</Text>
                <Text className="text-white text-3xl font-bold">{stats.bookmarked}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Search Bar */}
          <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200 dark:border-gray-600">
            <SearchIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search articles..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-900 dark:text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-600 shadow-md' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`font-semibold text-sm ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
          </Text>
        </View>
      </View>

      {/* Articles List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredArticles.length === 0 ? (
          <View className="items-center py-20 px-4">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
              <GlobeIcon size={48} color="#3B82F6" />
            </View>
            <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-4">No News Available</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
              {searchQuery 
                ? "Try adjusting your search"
                : "Check back later for the latest immigration updates"}
            </Text>
          </View>
        ) : (
          filteredArticles.map((article) => {
            const impactColor = getImpactColor(article.impactLevel);
            return (
              <TouchableOpacity
                key={article.id}
                onPress={() => router.push(`/immigration/article/${article.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-md border border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center flex-wrap gap-2 mb-2">
                      {article.isBreaking && (
                        <View className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                          <Text className="text-red-600 dark:text-red-400 text-xs font-bold">BREAKING</Text>
                        </View>
                      )}
                      {article.isVerified && (
                        <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">VERIFIED</Text>
                        </View>
                      )}
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${impactColor}20` }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: impactColor }}
                        >
                          {article.impactLevel}
                        </Text>
                      </View>
                    </View>
                    
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2" numberOfLines={2}>
                      {article.title}
                    </Text>
                    
                    {article.summary && (
                      <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-5" numberOfLines={3}>
                        {article.summary}
                      </Text>
                    )}
                    
                    <View className="flex-row items-center mb-2">
                      <GlobeIcon size={14} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {SOURCE_TYPE_LABELS[article.sourceType]} • {article.sourceName}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <CalendarIcon size={14} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {formatDate(article.publishedAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleBookmark(article);
                    }}
                    className="p-2"
                  >
                    <BookmarkIcon 
                      size={20} 
                      color={article.isBookmarked ? "#3B82F6" : (isDarkMode ? "#9CA3AF" : "#6B7280")} 
                    />
                  </TouchableOpacity>
                </View>
                
                {article.visaCategories.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {article.visaCategories.slice(0, 3).map((category, index) => (
                      <View key={index} className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium">{category}</Text>
                      </View>
                    ))}
                    {article.visaCategories.length > 3 && (
                      <View className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs">
                          +{article.visaCategories.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
