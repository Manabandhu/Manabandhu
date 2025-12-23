import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/Button";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";

export default function AuthIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await signInWithGoogle();
      if (result.user) {
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        
        if (!userDoc.exists()) {
          router.push("/(auth)/profile");
        } else {
          router.replace("/(onboarding)/welcome");
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await signInWithApple();
      if (result.user) {
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        
        if (!userDoc.exists()) {
          router.push("/(auth)/profile");
        } else {
          router.replace("/(onboarding)/welcome");
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#6366f1", "#4f46e5", "#4338ca"]}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6 py-12">
            <View className="items-center mb-12">
              <Text className="text-4xl font-bold text-white mb-3">
                ManaBandhu
              </Text>
              <Text className="text-lg text-white/90 text-center">
                Your trusted companion for life's journey
              </Text>
            </View>

            <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
              <SocialLoginButtons
                onGooglePress={handleGoogleSignIn}
                onApplePress={handleAppleSignIn}
                loading={loading}
              />

              <Button
                title="Continue with Email"
                onPress={() => router.push("/(auth)/login")}
                variant="outline"
                fullWidth
                className="mt-4"
              />
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

