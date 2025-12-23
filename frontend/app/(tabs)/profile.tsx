import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { UserIcon, SettingsIcon, BriefcaseIcon, HomeIcon, MessageIcon } from '@/components/ui/Icons';

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const profileStats = [
    { label: 'Posts', value: '12' },
    { label: 'Connections', value: '48' },
    { label: 'Reviews', value: '5' }
  ];

  const menuItems = [
    { icon: UserIcon, label: 'Edit Profile', route: '/profile/edit' },
    { icon: BriefcaseIcon, label: 'My Jobs', route: '/jobs' },
    { icon: HomeIcon, label: 'My Listings', route: '/rooms' },
    { icon: MessageIcon, label: 'Messages', route: '/chat' },
    { icon: SettingsIcon, label: 'Settings', route: '/profile/settings' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-8">
        <View className="items-center">
          {/* Profile Picture */}
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <UserIcon size={40} color="#6B7280" />
            )}
          </View>
          
          {/* User Info */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {user?.displayName || 'User'}
          </Text>
          <Text className="text-gray-600 mb-1">
            {user?.email}
          </Text>
          {user?.city && (
            <Text className="text-gray-500 text-sm">
              📍 {user.city}, {user.country}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row justify-around mt-6 pt-6 border-t border-gray-100">
          {profileStats.map((stat, index) => (
            <View key={index} className="items-center">
              <Text className="text-2xl font-bold text-gray-900">{stat.value}</Text>
              <Text className="text-gray-600 text-sm">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white mt-4 mx-4 rounded-xl">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center px-4 py-4 ${
              index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
            onPress={() => router.push(item.route as any)}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
              <item.icon size={20} color="#6B7280" />
            </View>
            <Text className="flex-1 text-gray-900 font-medium">{item.label}</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* About Section */}
      <View className="bg-white mt-4 mx-4 rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">About</Text>
        <Text className="text-gray-600 leading-6">
          Welcome to ManaBandhu! Connect with fellow immigrants, find housing, jobs, and build your community.
        </Text>
      </View>

      {/* Sign Out */}
      <View className="mt-6 mx-4 mb-8">
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-xl py-4"
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text className="text-red-600 text-center font-semibold">
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}