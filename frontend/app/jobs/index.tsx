import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Modal } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/components/ui/Header";
import { jobsAPI, Job } from "@/lib/api/jobs";
import { BriefcaseIcon, SearchIcon, MapPinIcon, FilterIcon, XIcon, PlusIcon, CalendarIcon } from "@/components/ui/Icons";
import PostJobBottomSheet from "@/components/PostJobBottomSheet";
import { useThemeStore } from "@/store/theme.store";

const jobTypes = [
  { key: 'ALL', label: 'All Jobs', color: '#6366F1' },
  { key: 'FULL_TIME', label: 'Full Time', color: '#10B981' },
  { key: 'PART_TIME', label: 'Part Time', color: '#3B82F6' },
  { key: 'CONTRACT', label: 'Contract', color: '#F59E0B' },
  { key: 'REMOTE', label: 'Remote', color: '#8B5CF6' },
];

type SortOption = 'recent' | 'salary_high' | 'salary_low' | 'company';

export default function Jobs() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showPostJobSheet, setShowPostJobSheet] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const loadJobs = async () => {
    try {
      let response;
      if (searchQuery.trim()) {
        response = await jobsAPI.searchJobs(searchQuery.trim());
      } else if (selectedType !== 'ALL') {
        response = await jobsAPI.getJobsByType(selectedType);
      } else {
        response = await jobsAPI.getAllJobs(0, 20);
      }
      setJobs(response.content);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  useEffect(() => {
    loadJobs();
  }, [selectedType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadJobs();
      } else {
        loadJobs();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = jobs.length;
    const fullTime = jobs.filter(j => j.type === 'FULL_TIME').length;
    const remote = jobs.filter(j => j.type === 'REMOTE').length;
    const avgSalary = jobs.length > 0 
      ? jobs.reduce((sum, j) => sum + (j.salaryMin || 0) + (j.salaryMax || 0), 0) / (jobs.length * 2)
      : 0;
    
    return { total, fullTime, remote, avgSalary };
  }, [jobs]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'salary_high':
          const aMax = a.salaryMax || a.salaryMin || 0;
          const bMax = b.salaryMax || b.salaryMin || 0;
          return bMax - aMax;
        case 'salary_low':
          const aMin = a.salaryMin || a.salaryMax || 0;
          const bMin = b.salaryMin || b.salaryMax || 0;
          return aMin - bMin;
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [jobs, sortBy]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '';
    if (min && max) return `$${min}k - $${max}k`;
    if (min) return `$${min}k+`;
    return `Up to $${max}k`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = jobTypes.find(t => t.key === type);
    return typeConfig?.color || '#6B7280';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Jobs" />
      
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center justify-end mb-4">
            <TouchableOpacity
              onPress={() => setShowPostJobSheet(true)}
              className="bg-blue-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Post</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              <View className="bg-blue-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#3B82F6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Jobs</Text>
                <Text className="text-white text-3xl font-bold">{stats.total}</Text>
              </View>
              <View className="bg-green-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#10B981" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Full Time</Text>
                <Text className="text-white text-3xl font-bold">{stats.fullTime}</Text>
              </View>
              <View className="bg-purple-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#8B5CF6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Remote</Text>
                <Text className="text-white text-3xl font-bold">{stats.remote}</Text>
              </View>
              {stats.avgSalary > 0 && (
                <View className="bg-amber-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#F59E0B" }}>
                  <Text className="text-white/90 text-xs font-medium mb-1">Avg Salary</Text>
                  <Text className="text-white text-2xl font-bold">${Math.round(stats.avgSalary)}k</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Search Bar */}
          <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200 dark:border-gray-600">
            <SearchIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search jobs, companies, locations..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-900 dark:text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XIcon size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              </TouchableOpacity>
            )}
          </View>

          {/* Job Type Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              {jobTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setSelectedType(type.key)}
                  className={`px-4 py-2.5 rounded-full ${
                    selectedType === type.key 
                      ? "bg-blue-600 shadow-md" 
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                  style={selectedType === type.key ? { backgroundColor: type.color } : {}}
                >
                  <Text className={`font-semibold text-sm ${
                    selectedType === type.key ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sort Button */}
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAndSortedJobs.length} {filteredAndSortedJobs.length === 1 ? "job" : "jobs"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSortModal(true)}
              className="flex-row items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
            >
              <FilterIcon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
              <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2 font-medium">
                Sort: {sortBy === 'recent' ? 'Recent' : 
                       sortBy === 'salary_high' ? 'Salary (High)' : 
                       sortBy === 'salary_low' ? 'Salary (Low)' : 
                       'Company'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Jobs List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && (
          <View className="items-center py-20">
            <Text className="text-gray-500 dark:text-gray-400 text-base">Loading jobs...</Text>
          </View>
        )}

        {!loading && filteredAndSortedJobs.length === 0 && (
          <View className="items-center py-20 px-4">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
              <BriefcaseIcon size={48} color="#3B82F6" />
            </View>
            <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-4">No jobs found</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
              {searchQuery 
                ? "Try adjusting your search or filters"
                : "Be the first to post a job opportunity."}
            </Text>
            <TouchableOpacity
              onPress={() => setShowPostJobSheet(true)}
              className="mt-6 bg-blue-600 px-6 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold">+ Post a Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && filteredAndSortedJobs.map((job) => {
          const typeColor = getTypeColor(job.type);
          return (
            <TouchableOpacity
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-md border border-gray-100 dark:border-gray-700"
              onPress={() => router.push(`/jobs/detail?id=${job.id}`)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={2}>
                    {job.title}
                  </Text>
                  <Text className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    {job.company}
                  </Text>
                </View>
                <View 
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <Text 
                    className="text-xs font-semibold"
                    style={{ color: typeColor }}
                  >
                    {job.type.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-3">
                <MapPinIcon size={16} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <Text className="text-gray-600 dark:text-gray-400 text-sm ml-1">{job.location}</Text>
                {formatSalary(job.salaryMin, job.salaryMax) && (
                  <>
                    <Text className="text-gray-400 dark:text-gray-500 mx-2">•</Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </Text>
                  </>
                )}
              </View>
              
              <Text className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-5" numberOfLines={2}>
                {job.description}
              </Text>
              
              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center">
                  <CalendarIcon size={14} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                  <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                    Posted {formatTime(job.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg"
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/jobs/detail?id=${job.id}`);
                  }}
                >
                  <Text className="text-blue-600 dark:text-blue-400 text-xs font-semibold">View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Quick Actions */}
        <View className="mt-6 mb-8">
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-3"
            onPress={() => router.push("/jobs/resume-tips")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 mr-3">
                <BriefcaseIcon size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-white font-semibold">Resume Tips & AI Analysis</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Get expert advice on your resume</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
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
            {(['recent', 'salary_high', 'salary_low', 'company'] as SortOption[]).map((option) => (
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
                   option === 'salary_high' ? 'Salary: High to Low' :
                   option === 'salary_low' ? 'Salary: Low to High' :
                   'Company: A to Z'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <PostJobBottomSheet 
        visible={showPostJobSheet}
        onClose={() => setShowPostJobSheet(false)}
        onJobPosted={loadJobs}
      />
    </SafeAreaView>
  );
}


