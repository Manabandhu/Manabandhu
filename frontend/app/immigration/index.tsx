import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { immigrationNewsApi, NewsArticle, NewsFilters } from '@/lib/api/immigration';
import { IMPACT_LEVEL_COLORS, SOURCE_TYPE_LABELS } from '@/types/immigration';

export default function ImmigrationNewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<NewsFilters>({});

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
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Loading news...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Immigration News</Text>
            <Text className="text-gray-600 mt-1">Verified updates & policy changes</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/immigration/bookmarks')}>
            <Ionicons name="bookmark-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          <View className="flex-row space-x-4">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Text className={`font-medium ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-700'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {articles.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="newspaper-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">No News Available</Text>
            <Text className="text-gray-600 text-center mt-2 px-8">
              Check back later for the latest immigration updates
            </Text>
          </View>
        ) : (
          <View className="p-4 space-y-4">
            {articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => router.push(`/immigration/article/${article.id}`)}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-2">
                      {article.isBreaking && (
                        <View className="bg-red-100 px-2 py-1 rounded-full mr-2">
                          <Text className="text-red-600 text-xs font-bold">BREAKING</Text>
                        </View>
                      )}
                      {article.isVerified && (
                        <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                          <Text className="text-green-600 text-xs font-medium">VERIFIED</Text>
                        </View>
                      )}
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: getImpactColor(article.impactLevel) + '20' }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: getImpactColor(article.impactLevel) }}
                        >
                          {article.impactLevel}
                        </Text>
                      </View>
                    </View>
                    
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      {article.title}
                    </Text>
                    
                    {article.summary && (
                      <Text className="text-gray-600 text-sm mb-3 leading-5">
                        {article.summary}
                      </Text>
                    )}
                    
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-xs text-gray-500">
                          {SOURCE_TYPE_LABELS[article.sourceType]} • {article.sourceName}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {formatDate(article.publishedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => toggleBookmark(article)}
                    className="p-2"
                  >
                    <Ionicons
                      name={article.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={article.isBookmarked ? '#3B82F6' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
                
                {article.visaCategories.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {article.visaCategories.slice(0, 3).map((category, index) => (
                      <View key={index} className="bg-blue-50 px-2 py-1 rounded">
                        <Text className="text-blue-600 text-xs font-medium">{category}</Text>
                      </View>
                    ))}
                    {article.visaCategories.length > 3 && (
                      <View className="bg-gray-50 px-2 py-1 rounded">
                        <Text className="text-gray-600 text-xs">
                          +{article.visaCategories.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}