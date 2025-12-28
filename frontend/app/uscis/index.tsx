import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import { uscisApi, UscisCase } from '@/lib/api/uscis';
import { FORM_TYPE_LABELS, STATUS_COLORS } from '@/types/uscis';
import { FileIcon, PlusIcon, CalendarIcon, XIcon, FilterIcon, CheckCircleIcon } from '@/components/ui/Icons';
import { useThemeStore } from '@/store/theme.store';

type SortOption = 'recent' | 'status' | 'form_type';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rfe';

export default function UscisTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const [cases, setCases] = useState<UscisCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showSortModal, setShowSortModal] = useState(false);

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter(c => c.caseStatusCode?.includes('PENDING') || c.caseStatusCode?.includes('RECEIVED')).length;
    const approved = cases.filter(c => c.caseStatusCode?.includes('APPROVED') || c.caseStatusCode?.includes('APPROVAL')).length;
    const rfe = cases.filter(c => c.caseStatusCode?.includes('RFE')).length;
    const avgDaysPending = cases.length > 0
      ? Math.round(cases.reduce((sum, c) => sum + (c.daysPending || 0), 0) / cases.length)
      : 0;
    
    return { total, pending, approved, rfe, avgDaysPending };
  }, [cases]);

  // Filter and sort cases
  const filteredAndSortedCases = useMemo(() => {
    let filtered = [...cases];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => {
        const status = c.caseStatusCode || '';
        switch (statusFilter) {
          case 'pending':
            return status.includes('PENDING') || status.includes('RECEIVED');
          case 'approved':
            return status.includes('APPROVED') || status.includes('APPROVAL');
          case 'rfe':
            return status.includes('RFE');
          default:
            return true;
        }
      });
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return (a.caseStatus || '').localeCompare(b.caseStatus || '');
        case 'form_type':
          return (a.formType || '').localeCompare(b.formType || '');
        case 'recent':
        default:
          return new Date(b.lastStatusDate).getTime() - new Date(a.lastStatusDate).getTime();
      }
    });

    return filtered;
  }, [cases, sortBy, statusFilter]);

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
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center">
        <Header title="USCIS" />
        <Text className="text-gray-500 dark:text-gray-400 text-base">Loading cases...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="USCIS" />
      
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center justify-end mb-4">
            <TouchableOpacity
              onPress={() => router.push('/uscis/add-case')}
              className="bg-blue-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Add Case</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              <View className="bg-blue-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#3B82F6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Cases</Text>
                <Text className="text-white text-3xl font-bold">{stats.total}</Text>
              </View>
              <View className="bg-amber-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#F59E0B" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Pending</Text>
                <Text className="text-white text-3xl font-bold">{stats.pending}</Text>
              </View>
              <View className="bg-green-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#10B981" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Approved</Text>
                <Text className="text-white text-3xl font-bold">{stats.approved}</Text>
              </View>
              {stats.avgDaysPending > 0 && (
                <View className="bg-purple-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#8B5CF6" }}>
                  <Text className="text-white/90 text-xs font-medium mb-1">Avg Days</Text>
                  <Text className="text-white text-2xl font-bold">{stats.avgDaysPending}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Status Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              {(['all', 'pending', 'approved', 'rfe'] as StatusFilter[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setStatusFilter(filter)}
                  className={`px-4 py-2.5 rounded-full ${
                    statusFilter === filter 
                      ? "bg-blue-600 shadow-md" 
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Text className={`font-semibold text-sm ${
                    statusFilter === filter ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sort Button */}
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAndSortedCases.length} {filteredAndSortedCases.length === 1 ? "case" : "cases"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSortModal(true)}
              className="flex-row items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
            >
              <FilterIcon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2 font-medium">
                Sort: {sortBy === 'recent' ? 'Recent' : 
                       sortBy === 'status' ? 'Status' : 
                       'Form Type'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cases List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredAndSortedCases.length === 0 ? (
          <View className="items-center py-20 px-4">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
              <FileIcon size={48} color="#3B82F6" />
            </View>
            <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-4">No Cases Yet</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
              {statusFilter !== 'all'
                ? `No ${statusFilter} cases found.`
                : "Add your first USCIS case to start tracking its status"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/uscis/add-case')}
              className="mt-6 bg-blue-600 px-6 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold">+ Add Case</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAndSortedCases.map((caseItem) => {
            const statusColor = getStatusColor(caseItem.caseStatusCode);
            return (
              <TouchableOpacity
                key={caseItem.id}
                onPress={() => router.push(`/uscis/case/${caseItem.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-md border border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {caseItem.receiptNumber}
                    </Text>
                    <View 
                      className="px-3 py-1 rounded-full self-start"
                      style={{ backgroundColor: `${statusColor}15` }}
                    >
                      <Text 
                        className="text-xs font-semibold"
                        style={{ color: statusColor }}
                      >
                        {FORM_TYPE_LABELS[caseItem.formType] || caseItem.formType}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center mb-1">
                      <View 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: statusColor }}
                      />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">Status</Text>
                    </View>
                  </View>
                </View>

                <View className="mb-3">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {caseItem.caseStatus}
                  </Text>
                  {caseItem.statusDescription && (
                    <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5" numberOfLines={2}>
                      {caseItem.statusDescription}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <View className="flex-row items-center">
                    <CalendarIcon size={14} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                    <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                      Updated: {formatDate(caseItem.lastStatusDate)}
                    </Text>
                  </View>
                  {caseItem.daysPending && (
                    <View className="bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg">
                      <Text className="text-amber-700 dark:text-amber-400 text-xs font-semibold">
                        {caseItem.daysPending} days
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <XIcon size={24} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              </TouchableOpacity>
            </View>
            {(['recent', 'status', 'form_type'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
                className={`py-4 px-4 rounded-xl mb-2 ${
                  sortBy === option ? "bg-blue-50 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-700"
                }`}
              >
                <Text className={`font-semibold ${
                  sortBy === option ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}>
                  {option === 'recent' ? 'Most Recent' : 
                   option === 'status' ? 'Status: A to Z' :
                   'Form Type: A to Z'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
