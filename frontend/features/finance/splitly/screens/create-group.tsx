import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splitlyAPI } from '@/lib/api/splitly';

export default function CreateGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState(['']);
  const [loading, setLoading] = useState(false);

  const addMember = () => {
    setMembers([...members, '']);
  };

  const updateMember = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    const validMembers = members.filter(m => m.trim());
    if (validMembers.length === 0) {
      Alert.alert('Error', 'Please add at least one member');
      return;
    }

    setLoading(true);
    try {
      await splitlyAPI.createGroup({
        name: groupName.trim(),
        memberEmails: validMembers,
      });
      
      Alert.alert('Success', 'Group created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Create Group</Text>
        <TouchableOpacity 
          onPress={handleCreate}
          disabled={loading}
          className={`px-4 py-2 rounded-full ${loading ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          <Text className={`font-semibold ${loading ? 'text-gray-500' : 'text-white'}`}>
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Group Name *</Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="e.g. Roommates, Trip to Paris"
            className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Members</Text>
          {members.map((member, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <TextInput
                value={member}
                onChangeText={(value) => updateMember(index, value)}
                placeholder={index === 0 ? "Your name" : "Member name"}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
              {members.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeMember(index)}
                  className="ml-2 w-10 h-10 bg-red-100 rounded-lg items-center justify-center"
                >
                  <Text className="text-red-600 font-bold">×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity 
            onPress={addMember}
            className="bg-gray-100 rounded-lg p-3 items-center"
          >
            <Text className="text-gray-700 font-medium">+ Add Member</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 p-4 bg-green-50 rounded-lg">
          <Text className="text-green-800 text-sm font-medium mb-2">How Splitly Works</Text>
          <Text className="text-green-700 text-xs leading-5">
            • Add expenses and choose how to split them{'\n'}
            • Track who owes what to whom{'\n'}
            • Settle up when it's time to pay{'\n'}
            • Keep everyone in sync with notifications
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}