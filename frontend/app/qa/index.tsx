import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Question, QuestionsFilter } from '@/types/qa';
import { QuestionCard } from '@/components/qa/QuestionCard';
import { qaApi } from '@/lib/api/qa';
import { COLORS } from '@/constants/colors';
import { SearchIcon, PlusIcon } from '@/components/ui/Icons';

export default function QaHomeScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'RECENT' | 'VIEWS'>('RECENT');

  useEffect(() => {
    loadQuestions();
  }, [activeTab, sortBy]);

  const loadQuestions = async () => {
    try {
      const filter: QuestionsFilter = {
        sortBy,
        status: activeTab === 'unanswered' ? 'OPEN' : undefined,
        search: searchQuery || undefined,
      };

      const response = await qaApi.getQuestions(filter);
      setQuestions(response.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuestions();
  };

  const handleSearch = () => {
    setLoading(true);
    loadQuestions();
  };

  const handleAskQuestion = () => {
    router.push('/qa/ask');
  };

  const tabs = [
    { key: 'all', label: 'All Questions' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'my', label: 'My Questions' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'RECENT' && styles.activeSortButton]}
          onPress={() => setSortBy('RECENT')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'RECENT' && styles.activeSortButtonText]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'VIEWS' && styles.activeSortButton]}
          onPress={() => setSortBy('VIEWS')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'VIEWS' && styles.activeSortButtonText]}>
            Most Viewed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Community Q&A</Text>
        <TouchableOpacity style={styles.askButton} onPress={handleAskQuestion}>
          <PlusIcon size={20} color="#FFFFFF" />
          <Text style={styles.askButtonText}>Ask</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QuestionCard question={item} />}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading questions...' : 'No questions found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});