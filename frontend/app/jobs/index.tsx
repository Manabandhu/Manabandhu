import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { jobsAPI, Job } from "@/lib/api/jobs";
import { BriefcaseIcon, SearchIcon, MapPinIcon } from "@/components/ui/Icons";
import PostJobBottomSheet from "@/components/PostJobBottomSheet";

const jobTypes = [
  { key: 'ALL', label: 'All Jobs' },
  { key: 'FULL_TIME', label: 'Full Time' },
  { key: 'PART_TIME', label: 'Part Time' },
  { key: 'CONTRACT', label: 'Contract' },
  { key: 'REMOTE', label: 'Remote' },
];

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showPostJobSheet, setShowPostJobSheet] = useState(false);

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
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading jobs...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900">
          Jobs
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => setShowPostJobSheet(true)}
        >
          <Text className="text-white font-semibold">+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
        <SearchIcon size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-gray-900"
          placeholder="Search jobs, companies, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Job Type Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        {jobTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            className={`px-4 py-2 rounded-full mr-3 ${
              selectedType === type.key ? 'bg-blue-600' : 'bg-white'
            }`}
            onPress={() => setSelectedType(type.key)}
          >
            <Text className={`font-medium ${
              selectedType === type.key ? 'text-white' : 'text-gray-700'
            }`}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <BriefcaseIcon size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4">No jobs found</Text>
          <Text className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</Text>
        </View>
      ) : (
        jobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => router.push(`/jobs/detail?id=${job.id}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {job.title}
                </Text>
                <Text className="text-blue-600 font-medium mb-2">
                  {job.company}
                </Text>
              </View>
              <View className={`px-2 py-1 rounded-full ${
                job.type === 'FULL_TIME' ? 'bg-green-100' :
                job.type === 'REMOTE' ? 'bg-purple-100' :
                'bg-gray-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  job.type === 'FULL_TIME' ? 'text-green-700' :
                  job.type === 'REMOTE' ? 'text-purple-700' :
                  'text-gray-700'
                }`}>
                  {job.type.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <MapPinIcon size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">{job.location}</Text>
              {formatSalary(job.salaryMin, job.salaryMax) && (
                <>
                  <Text className="text-gray-400 mx-2">•</Text>
                  <Text className="text-gray-600">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </Text>
                </>
              )}
            </View>
            
            <Text className="text-gray-700 mb-3" numberOfLines={2}>
              {job.description}
            </Text>
            
            <Text className="text-gray-400 text-sm">
              Posted {formatTime(job.createdAt)}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* Quick Actions */}
      <View className="mt-6 mb-8">
        <TouchableOpacity
          className="bg-gray-100 rounded-xl p-4 mb-3"
          onPress={() => router.push("/jobs/resume-tips")}
        >
          <Text className="text-gray-900 text-center font-medium">
            📄 Resume Tips & AI Analysis
          </Text>
        </TouchableOpacity>
      </View>

      <PostJobBottomSheet 
        visible={showPostJobSheet}
        onClose={() => setShowPostJobSheet(false)}
        onJobPosted={loadJobs}
      />
    </ScrollView>
  );
}


