import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, phoneSchema, EmailInput, PhoneInput } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInWithEmail, signUpWithEmail, sendOTP } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";

type LoginMethod = "email" | "phone";

export default function LoginScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const phoneForm = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "", countryCode: "+1" },
  });

  const handleEmailSubmit = async (data: EmailInput) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { sendEmailLink } = await import("@/lib/firebase");
      const actionCodeSettings = {
        url: "manabandhu://auth",
        handleCodeInApp: true,
      };
      
      await sendEmailLink(data.email, actionCodeSettings);
      router.push({
        pathname: "/(auth)/otp",
        params: { email: data.email, emailLink: "true" },
      });
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      emailForm.setError("email", { message: error.message || "Failed to send email link" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (data: PhoneInput) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const fullPhoneNumber = `${data.countryCode}${data.phoneNumber}`;
      const id = await sendOTP(fullPhoneNumber, null);
      setVerificationId(id);
      router.push({
        pathname: "/(auth)/otp",
        params: { verificationId: id, phoneNumber: fullPhoneNumber },
      });
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      phoneForm.setError("phoneNumber", { message: error.message });
    } finally {
      setLoading(false);
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
            Welcome Back
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Sign in to continue to ManaBandhu
          </Text>
        </View>

        <View className="flex-row mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setMethod("email")}
            className={`flex-1 py-3 rounded-lg ${
              method === "email"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : ""
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                method === "email"
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMethod("phone")}
            className={`flex-1 py-3 rounded-lg ${
              method === "phone"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : ""
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                method === "phone"
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {method === "email" ? (
          <View>
            <Controller
              control={emailForm.control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />

            <Button
              title="Continue"
              onPress={emailForm.handleSubmit(handleEmailSubmit)}
              loading={loading}
              fullWidth
            />
          </View>
        ) : (
          <View>
            <Controller
              control={phoneForm.control}
              name="countryCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Country Code"
                  placeholder="+1"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Controller
              control={phoneForm.control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Button
              title="Send OTP"
              onPress={phoneForm.handleSubmit(handlePhoneSubmit)}
              loading={loading}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

