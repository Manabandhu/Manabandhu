import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { BellIcon, LockIcon, HelpIcon, FileIcon, TypeIcon } from '@/components/ui/Icons';
import { useFontStore } from '@/store/font.store';
import { useScaledFont } from '@/lib/useScaledFont';

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { scale, setScale, resetScale } = useFontStore();
  const { scaleFont } = useScaledFont();

  const fontPercentage = Math.round((scale - 1) * 100);

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          icon: BellIcon,
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: null,
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode
        },
        {
          icon: TypeIcon,
          label: 'Font Size',
          type: 'font-slider',
          value: scale,
          percentage: fontPercentage
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: LockIcon,
          label: 'Privacy Settings',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpIcon,
          label: 'Help & Support',
          type: 'navigation',
          onPress: () => Alert.alert('Help', 'Contact us at support@manabandhu.com')
        },
        {
          icon: FileIcon,
          label: 'Terms of Service',
          type: 'navigation',
          onPress: () => Alert.alert('Terms', 'Terms of service will be displayed here.')
        },
        {
          icon: FileIcon,
          label: 'Privacy Policy',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'Privacy policy will be displayed here.')
        }
      ]
    }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-lg" style={{ fontSize: scaleFont(18) }}>←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1" style={{ fontSize: scaleFont(18) }}>
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 py-4">
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-6">
            <Text className="text-gray-500 font-medium text-sm uppercase tracking-wide px-4 mb-2" style={{ fontSize: scaleFont(12) }}>
              {group.title}
            </Text>
            <View className="bg-white mx-4 rounded-xl">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className={`px-4 py-4 ${
                    itemIndex !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={item.onPress}
                  disabled={item.type === 'toggle' || item.type === 'font-slider'}
                >
                  {item.type === 'font-slider' ? (
                    <View className="w-full">
                      <View className="flex-row items-center mb-3">
                        {item.icon && (
                          <View className="w-8 h-8 items-center justify-center mr-3">
                            <item.icon size={20} color="#6B7280" />
                          </View>
                        )}
                        <Text className="flex-1 text-gray-900 font-medium" style={{ fontSize: scaleFont(16) }}>
                          {item.label}
                        </Text>
                        <Text className="text-gray-500 text-sm" style={{ fontSize: scaleFont(14) }}>
                          {item.percentage > 0 ? `+${item.percentage}%` : item.percentage === 0 ? 'Default' : `${item.percentage}%`}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-400 mr-2" style={{ fontSize: scaleFont(12) }}>A</Text>
                        <Slider
                          style={{ flex: 1, height: 40 }}
                          minimumValue={0.8}
                          maximumValue={1.5}
                          value={scale}
                          onValueChange={setScale}
                          minimumTrackTintColor="#3B82F6"
                          maximumTrackTintColor="#E5E7EB"
                          thumbStyle={{ backgroundColor: '#3B82F6' }}
                          step={0.1}
                        />
                        <Text className="text-lg text-gray-400 ml-2" style={{ fontSize: scaleFont(18) }}>A</Text>
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <TouchableOpacity
                          onPress={resetScale}
                          className="bg-gray-100 px-3 py-1 rounded-full"
                        >
                          <Text className="text-gray-600 text-xs font-medium" style={{ fontSize: scaleFont(12) }}>Reset</Text>
                        </TouchableOpacity>
                        <Text className="text-xs text-gray-400" style={{ fontSize: scaleFont(12) }}>80% - 150%</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      {item.icon && (
                        <View className="w-8 h-8 items-center justify-center mr-3">
                          <item.icon size={20} color="#6B7280" />
                        </View>
                      )}
                      <Text className="flex-1 text-gray-900 font-medium" style={{ fontSize: scaleFont(16) }}>
                        {item.label}
                      </Text>
                      {item.type === 'toggle' ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                          thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                        />
                      ) : (
                        <Text className="text-gray-400" style={{ fontSize: scaleFont(18) }}>›</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-gray-400 text-sm" style={{ fontSize: scaleFont(14) }}>ManaBandhu v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}