import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { uscisApi, UscisCase, TimelineEntry } from '@/features/immigration/cases/api';
import { FORM_TYPE_LABELS, STATUS_COLORS } from '@/shared/types/uscis';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [caseData, setCaseData] = useState<UscisCase | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadCaseData();
    }
  }, [id]);

  const loadCaseData = async () => {
    try {
      const [caseDetails, caseTimeline] = await Promise.all([
        uscisApi.getCaseDetails(id!),
        uscisApi.getCaseTimeline(id!)
      ]);
      setCaseData(caseDetails);
      setTimeline(caseTimeline);
    } catch (error) {
      Alert.alert('Error', 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedCase = await uscisApi.refreshCase(id!);
      setCaseData(refreshedCase);
      await loadCaseData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh case');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveCase = () => {
    Alert.alert(
      'Remove Case',
      'Are you sure you want to stop tracking this case?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await uscisApi.removeCase(id!);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove case');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (statusCode: string) => {
    return STATUS_COLORS[statusCode] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Loading case details...</Text>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Case not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {caseData.receiptNumber}
              </Text>
              <Text className="text-gray-600">
                {FORM_TYPE_LABELS[caseData.formType]}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemoveCase}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Status */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-6 border border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Current Status</Text>
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(caseData.caseStatusCode) }}
            />
          </View>
          
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {caseData.caseStatus}
          </Text>
          
          {caseData.statusDescription && (
            <Text className="text-gray-600 mb-4">
              {caseData.statusDescription}
            </Text>
          )}
          
          <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
            <Text className="text-sm text-gray-500">
              Last updated: {formatDate(caseData.lastStatusDate)}
            </Text>
            {caseData.daysPending && (
              <Text className="text-sm text-gray-500">
                {caseData.daysPending} days pending
              </Text>
            )}
          </View>
        </View>

        {/* Case Info */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-6 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Case Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Service Center</Text>
              <Text className="font-medium text-gray-900">{caseData.serviceCenter}</Text>
            </View>
            
            {caseData.receivedDate && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Received Date</Text>
                <Text className="font-medium text-gray-900">
                  {formatDate(caseData.receivedDate)}
                </Text>
              </View>
            )}
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Last Checked</Text>
              <Text className="font-medium text-gray-900">
                {formatDate(caseData.lastCheckedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        {timeline.length > 0 && (
          <View className="bg-white mx-4 mt-4 mb-4 rounded-lg p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Status History</Text>
            
            <View className="space-y-4">
              {timeline.map((entry, index) => (
                <View key={entry.id} className="flex-row">
                  <View className="items-center mr-4">
                    <View className="w-3 h-3 bg-blue-600 rounded-full" />
                    {index < timeline.length - 1 && (
                      <View className="w-0.5 h-8 bg-gray-200 mt-2" />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {entry.statusTitle}
                    </Text>
                    {entry.statusDescription && (
                      <Text className="text-gray-600 text-sm mt-1">
                        {entry.statusDescription}
                      </Text>
                    )}
                    <Text className="text-xs text-gray-500 mt-2">
                      {formatDate(entry.statusDate)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Refresh Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            className={`py-4 rounded-lg border-2 border-blue-600 ${
              refreshing ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-blue-600 text-center font-semibold text-base">
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}