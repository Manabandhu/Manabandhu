import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)");
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <LinearGradient
        colors={["#6366f1", "#4f46e5"]}
        className="pt-16 pb-8 px-6"
      >
        <Text className="text-3xl font-bold text-white mb-2">
          Welcome back!
        </Text>
        <Text className="text-white/90 text-lg">
          {user?.displayName || "User"}
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-8">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Your ManaBandhu journey starts here. More features coming soon!
          </Text>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

