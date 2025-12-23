import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.auth.root);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <LinearGradient colors={GRADIENTS.primaryShort} className="pt-16 pb-8 px-6">
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

