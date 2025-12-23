import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { jobsAPI, Job } from '@/lib/api/jobs';
import { MapPinIcon, BriefcaseIcon, DollarSignIcon } from '@/components/ui/Icons';

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const jobData = await jobsAPI.getJobById(parseInt(id!));
      setJob(jobData);
    } catch (error) {
      console.error('Failed to load job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (job?.contactEmail) {
      const subject = `Application for ${job.title} at ${job.company}`;
      const body = `Hi,\n\nI am interested in applying for the ${job.title} position at ${job.company}.\n\nBest regards`;
      Linking.openURL(`mailto:${job.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      Alert.alert('Contact Info', 'No contact email provided for this job.');
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
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
        <Text className="text-gray-500">Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Job not found</Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-600 px-6 py-2 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          Job Details
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Job Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {job.title}
          </Text>
          <Text className="text-xl text-blue-600 font-semibold mb-4">
            {job.company}
          </Text>
          
          <View className="flex-row items-center mb-2">
            <MapPinIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{job.location}</Text>
          </View>
          
          <View className="flex-row items-center mb-2">
            <BriefcaseIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{job.type.replace('_', ' ')}</Text>
          </View>
          
          <View className="flex-row items-center mb-4">
            <DollarSignIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </Text>
          </View>
          
          <Text className="text-gray-500 text-sm">
            Posted {formatTime(job.createdAt)}
          </Text>
        </View>

        {/* Job Description */}
        <View className="px-6 py-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Job Description
          </Text>
          <Text className="text-gray-700 leading-6 mb-6">
            {job.description}
          </Text>
          
          {job.requirements && (
            <>
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Requirements
              </Text>
              <Text className="text-gray-700 leading-6">
                {job.requirements}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4"
          onPress={handleApply}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Apply Now
          </Text>
        </TouchableOpacity>
        
        {job.contactEmail && (
          <Text className="text-gray-500 text-center text-sm mt-2">
            Contact: {job.contactEmail}
          </Text>
        )}
      </View>
    </View>
  );
}