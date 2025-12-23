import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema, OTPInput as OTPInputType } from "@/lib/validators";
import { OTPInput } from "@/components/ui/OTPInput";
import { Button } from "@/components/ui/Button";
import { verifyOTP } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ verificationId?: string; phoneNumber?: string; email?: string; emailLink?: string }>();
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPComplete = async (otp: string) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (params.verificationId) {
        await verifyOTP(params.verificationId, otp);
      } else if (params.email && params.emailLink) {
        const { signInWithEmailLink, checkEmailLink } = await import("@/lib/firebase");
        const emailLink = otp;
        if (checkEmailLink(emailLink)) {
          await signInWithEmailLink(params.email, emailLink);
        } else {
          throw new Error("Invalid email link");
        }
      } else {
        throw new Error("No verification method provided");
      }

      const { db, getCurrentUser } = await import("@/lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");
      const user = getCurrentUser();
      
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          router.push("/(auth)/profile");
        } else {
          router.replace("/(onboarding)/welcome");
        }
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      setResendTimer(60);
      setCanResend(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (params.phoneNumber) {
        const { sendOTP } = await import("@/lib/firebase");
        const id = await sendOTP(params.phoneNumber, null);
        router.setParams({ verificationId: id });
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6"
        >
          <Text className="text-primary-600 text-base">← Back</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Code
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {params.emailLink 
              ? "Check your email and enter the magic link code, or paste the full link below"
              : `Enter the 6-digit code sent to\n${params.phoneNumber || params.email}`}
          </Text>
        </View>

        <View className="mb-6">
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
          />
        </View>

        <View className="items-center">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend}
            className={`${!canResend ? "opacity-50" : ""}`}
          >
            <Text className="text-primary-600 font-semibold">
              {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

