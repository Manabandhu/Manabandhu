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
import { uscisApi, UscisCase } from '@/lib/api/uscis';
import { FORM_TYPE_LABELS, STATUS_COLORS } from '@/types/uscis';

export default function UscisTrackerScreen() {
  const [cases, setCases] = useState<UscisCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const userCases = await uscisApi.getUserCases();
      setCases(userCases);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCases();
    setRefreshing(false);
  };

  const getStatusColor = (statusCode: string) => {
    return STATUS_COLORS[statusCode] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Loading cases...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">USCIS Tracker</Text>
            <Text className="text-gray-600 mt-1">Track your immigration cases</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/uscis/add-case')}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cases.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">No Cases Yet</Text>
            <Text className="text-gray-600 text-center mt-2 px-8">
              Add your first USCIS case to start tracking its status
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/uscis/add-case')}
              className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
            >
              <Text className="text-white font-semibold">Add Case</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4 space-y-4">
            {cases.map((caseItem) => (
              <TouchableOpacity
                key={caseItem.id}
                onPress={() => router.push(`/uscis/case/${caseItem.id}`)}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {caseItem.receiptNumber}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {FORM_TYPE_LABELS[caseItem.formType]}
                    </Text>
                  </View>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: getStatusColor(caseItem.caseStatusCode) + '20' }}
                  >
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(caseItem.caseStatusCode) }}
                    />
                  </View>
                </View>

                <View className="mt-3">
                  <Text className="text-base font-medium text-gray-900">
                    {caseItem.caseStatus}
                  </Text>
                  {caseItem.statusDescription && (
                    <Text className="text-sm text-gray-600 mt-1">
                      {caseItem.statusDescription}
                    </Text>
                  )}
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-xs text-gray-500">
                    Last updated: {formatDate(caseItem.lastStatusDate)}
                  </Text>
                  {caseItem.daysPending && (
                    <Text className="text-xs text-gray-500">
                      {caseItem.daysPending} days pending
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}