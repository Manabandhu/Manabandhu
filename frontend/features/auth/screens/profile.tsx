import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileInput } from "@/lib/validators";
import { GluestackInput } from "@/shared/components/ui/gluestack-index";
import { GluestackButton } from "@/shared/components/ui/gluestack-index";
import { onboardingApi } from "@/lib/api";
import * as Haptics from "expo-haptics";
import { ROUTES } from "@/shared/constants/routes";

const roles = [
  { value: "student", label: "Student" },
  { value: "worker", label: "Worker" },
  { value: "visitor", label: "Visitor" },
];

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
];

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      country: "",
      city: "",
      role: undefined,
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await onboardingApi.updateOnboarding({
        displayName: data.displayName,
        country: data.country,
        city: data.city,
        role: data.role,
      });

      router.replace(ROUTES.onboarding.welcome);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Help us personalize your experience
          </Text>
        </View>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <GluestackInput
              label="Full Name"
              placeholder="Enter your full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country}
                    onPress={() => onChange(country)}
                    className={`mr-2 px-4 py-2 rounded-lg border-2 ${
                      value === country
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        value === country
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {error && (
                <Text className="text-sm text-error-500 mt-1">{error.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <GluestackInput
              label="City"
              placeholder="Enter your city"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {roles.map((role) => (
              <Controller
                key={role.value}
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    onPress={() => onChange(role.value as ProfileInput["role"])}
                    className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl border-2 ${
                      value === role.value
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        value === role.value
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
          {errors.role && (
            <Text className="text-sm text-error-500 mt-1">{errors.role.message}</Text>
          )}
        </View>

        <GluestackButton
          onPress={handleSubmit(onSubmit)}
          isLoading={loading}
          fullWidth
          className="mt-4"
        >
          Continue
        </GluestackButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

