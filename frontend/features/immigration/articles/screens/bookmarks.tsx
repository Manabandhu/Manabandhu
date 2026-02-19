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
import { immigrationNewsApi, NewsArticle } from '@/features/immigration/articles/api';
import { IMPACT_LEVEL_COLORS, SOURCE_TYPE_LABELS } from '@/shared/types/immigration';

export default function BookmarkedNewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookmarkedNews();
  }, []);

  const loadBookmarkedNews = async () => {
    try {
      const response = await immigrationNewsApi.getBookmarkedNews();
      setArticles(response.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bookmarked news');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarkedNews();
    setRefreshing(false);
  };

  const removeBookmark = async (article: NewsArticle) => {
    try {
      await immigrationNewsApi.removeBookmark(article.id);
      setArticles(prev => prev.filter(a => a.id !== article.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove bookmark');
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

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Bookmarked News</Text>
            <Text className="text-gray-600 mt-1">Your saved immigration articles</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {articles.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="bookmark-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">No Bookmarks Yet</Text>
            <Text className="text-gray-600 text-center mt-2 px-8">
              Bookmark important immigration news to read them later
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
            >
              <Text className="text-white font-semibold">Browse News</Text>
            </TouchableOpacity>
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
                    onPress={() => removeBookmark(article)}
                    className="p-2"
                  >
                    <Ionicons name="bookmark" size={20} color="#3B82F6" />
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