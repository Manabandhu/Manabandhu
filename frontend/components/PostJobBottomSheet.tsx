import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { jobsAPI, CreateJobRequest } from '@/shared/api/jobs';

interface PostJobBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onJobPosted?: () => void;
}

export default function PostJobBottomSheet({ visible, onClose, onJobPosted }: PostJobBottomSheetProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    contactEmail: ''
  });
  const [loading, setLoading] = useState(false);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: '',
      contactEmail: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.company || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const jobRequest: CreateJobRequest = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        type: formData.type.replace('-', '_').toUpperCase() as any,
        contactEmail: formData.contactEmail,
        requirements: formData.requirements,
      };

      if (formData.salary) {
        const salaryMatch = formData.salary.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
        if (salaryMatch) {
          jobRequest.salaryMin = parseInt(salaryMatch[1].replace(/,/g, ''));
          jobRequest.salaryMax = parseInt(salaryMatch[2].replace(/,/g, ''));
        }
      }

      await jobsAPI.createJob(jobRequest);
      
      resetForm();
      onClose();
      onJobPosted?.();
      
      Alert.alert('Success', 'Job posted successfully!');
    } catch (error) {
      console.error('Failed to create job:', error);
      Alert.alert('Error', `Failed to post job: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-end"
        onPress={handleClose}
      >
        <Pressable 
          className="bg-white rounded-t-3xl max-h-[90%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-blue-600 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Post Job</Text>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 rounded-full ${loading ? 'bg-gray-300' : 'bg-blue-600'}`}
            >
              <Text className={`font-semibold ${loading ? 'text-gray-500' : 'text-white'}`}>
                {loading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Job Title *</Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="e.g. Software Engineer"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Company *</Text>
              <TextInput
                value={formData.company}
                onChangeText={(text) => setFormData({...formData, company: text})}
                placeholder="Company name"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="e.g. San Francisco, CA"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Job Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {jobTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFormData({...formData, type})}
                      className={`px-4 py-2 rounded-full border ${
                        formData.type === type 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text className={`font-medium ${
                        formData.type === type ? 'text-white' : 'text-gray-700'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Salary Range</Text>
              <TextInput
                value={formData.salary}
                onChangeText={(text) => setFormData({...formData, salary: text})}
                placeholder="e.g. $80,000 - $120,000"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Job Description *</Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Requirements</Text>
              <TextInput
                value={formData.requirements}
                onChangeText={(text) => setFormData({...formData, requirements: text})}
                placeholder="Skills, experience, education requirements..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Contact Email</Text>
              <TextInput
                value={formData.contactEmail}
                onChangeText={(text) => setFormData({...formData, contactEmail: text})}
                placeholder="hiring@company.com"
                keyboardType="email-address"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mt-4 p-4 bg-gray-50 rounded-lg mb-6">
              <Text className="text-gray-600 text-sm font-medium mb-2">Posting Guidelines</Text>
              <Text className="text-gray-500 text-xs leading-5">
                • Be honest about job requirements and compensation{'\n'}
                • Include clear job responsibilities{'\n'}
                • Provide legitimate contact information{'\n'}
                • No discriminatory language
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}