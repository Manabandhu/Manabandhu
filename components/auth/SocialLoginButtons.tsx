import React from "react";
import { View, Text, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/Button";

interface SocialLoginButtonsProps {
  onGooglePress: () => Promise<void>;
  onApplePress: () => Promise<void>;
  loading?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGooglePress,
  onApplePress,
  loading = false,
}) => {
  const isAppleAvailable = Platform.OS === "ios" || Platform.OS === "web";

  return (
    <View className="space-y-3">
      {isAppleAvailable && (
        <TouchableOpacity
          onPress={onApplePress}
          disabled={loading}
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-black dark:bg-white rounded-xl py-4 px-6"
        >
          {loading ? (
            <ActivityIndicator color={Platform.OS === "ios" ? "#ffffff" : "#000000"} />
          ) : (
            <>
              <Text className="text-white dark:text-black text-base font-semibold ml-2">
                Continue with Apple
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onGooglePress}
        disabled={loading}
        activeOpacity={0.8}
        className="flex-row items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl py-4 px-6"
      >
        {loading ? (
          <ActivityIndicator color="#4285F4" />
        ) : (
          <>
            <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold ml-2">
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
        <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">OR</Text>
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
      </View>
    </View>
  );
};

