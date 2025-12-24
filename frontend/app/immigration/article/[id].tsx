import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { immigrationNewsApi, NewsArticle } from '@/lib/api/immigration';
import { IMPACT_LEVEL_COLORS, SOURCE_TYPE_LABELS } from '@/types/immigration';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const articleData = await immigrationNewsApi.getNewsById(id!);
      setArticle(articleData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!article) return;
    
    try {
      if (article.isBookmarked) {
        await immigrationNewsApi.removeBookmark(article.id);
      } else {
        await immigrationNewsApi.bookmarkArticle(article.id);
      }
      
      setArticle(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const openSource = () => {
    if (article?.sourceUrl) {
      Linking.openURL(article.sourceUrl);
    }
  };

  const getImpactColor = (level: string) => {
    return IMPACT_LEVEL_COLORS[level as keyof typeof IMPACT_LEVEL_COLORS] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Loading article...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Article not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">Immigration News</Text>
          </View>
          <TouchableOpacity onPress={toggleBookmark}>
            <Ionicons
              name={article.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={article.isBookmarked ? '#3B82F6' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Badges */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {article.isBreaking && (
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-600 text-sm font-bold">BREAKING NEWS</Text>
              </View>
            )}
            {article.isVerified && (
              <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-green-600 text-sm font-medium ml-1">VERIFIED</Text>
              </View>
            )}
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: getImpactColor(article.impactLevel) + '20' }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: getImpactColor(article.impactLevel) }}
              >
                {article.impactLevel} IMPACT
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-4 leading-8">
            {article.title}
          </Text>

          {/* Summary */}
          {article.summary && (
            <View className="bg-blue-50 p-4 rounded-lg mb-6">
              <Text className="text-blue-900 font-medium mb-2">Summary</Text>
              <Text className="text-blue-800 leading-6">{article.summary}</Text>
            </View>
          )}

          {/* Meta Information */}
          <View className="bg-gray-50 p-4 rounded-lg mb-6">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Source</Text>
                <Text className="text-gray-600">{article.sourceName}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {SOURCE_TYPE_LABELS[article.sourceType]}
                </Text>
              </View>
              <TouchableOpacity
                onPress={openSource}
                className="bg-blue-600 px-3 py-2 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">View Source</Text>
              </TouchableOpacity>
            </View>
            
            <View className="border-t border-gray-200 pt-3">
              <Text className="text-sm text-gray-600">
                Published: {formatDate(article.publishedAt)}
              </Text>
            </View>
          </View>

          {/* Visa Categories */}
          {article.visaCategories.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Affected Visa Categories</Text>
              <View className="flex-row flex-wrap gap-2">
                {article.visaCategories.map((category, index) => (
                  <View key={index} className="bg-blue-100 px-3 py-2 rounded-lg">
                    <Text className="text-blue-700 font-medium">{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Countries */}
          {article.countriesAffected.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Countries Affected</Text>
              <View className="flex-row flex-wrap gap-2">
                {article.countriesAffected.map((country, index) => (
                  <View key={index} className="bg-green-100 px-3 py-2 rounded-lg">
                    <Text className="text-green-700 font-medium">{country}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Content */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Full Article</Text>
            <Text className="text-gray-700 leading-7 text-base">
              {article.content}
            </Text>
          </View>

          {/* Verification Notes */}
          {article.verificationNotes && (
            <View className="bg-yellow-50 p-4 rounded-lg mb-6">
              <Text className="text-yellow-900 font-medium mb-2">Verification Notes</Text>
              <Text className="text-yellow-800">{article.verificationNotes}</Text>
            </View>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-100 px-3 py-2 rounded-lg">
                    <Text className="text-gray-700">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Disclaimer */}
          <View className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
            <Text className="text-sm text-gray-600 leading-5">
              <Text className="font-medium">Disclaimer:</Text> This information is for general guidance only. 
              Always consult with qualified immigration attorneys for specific legal advice. 
              ManaBandhu is not responsible for any decisions made based on this information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}