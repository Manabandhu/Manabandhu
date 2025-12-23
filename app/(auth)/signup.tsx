import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { UserIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { signUpWithEmail } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth.store";
import { COLORS } from "@/constants";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await signUpWithEmail(data.email, data.password);
      if (result.user) {
        // Update user profile with name
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(result.user, { displayName: data.fullName });
        
        setUser(result.user);
        router.push("/(auth)/profile");
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#6366f1", "#4f46e5", "#4338ca"]}
            start={{ x: 0.09, y: 0.21 }}
            end={{ x: 0.91, y: 0.79 }}
            style={styles.heroGradient}
          >
            {/* Circle Decorations */}
            <View style={[styles.circleDecoration, styles.circle1]} />
            <View style={[styles.circleDecoration, styles.circle2]} />

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <Logo size={60} />
              <Text style={styles.heroTitle}>Create Account</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formDescription}>Enter your details to get started</Text>

          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.fullName && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <UserIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                    />
                  )}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <EmailIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.phoneNumber && styles.inputWrapperError,
                ]}
              >
                <View style={styles.countryCodeWrapper}>
                  <Text style={styles.countryFlag}>🇺🇸</Text>
                  <Text style={styles.countryCode}>+1</Text>
                </View>
                <View style={styles.divider} />
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.phoneInput]}
                      placeholder="Phone Number"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              </View>
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} color="#6b7280" />
                  ) : (
                    <EyeIcon size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleButton}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon size={20} color="#6b7280" />
                  ) : (
                    <EyeIcon size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <Controller
                control={control}
                name="termsAccepted"
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onToggle={() => onChange(!value)}
                    error={!!errors.termsAccepted}
                    label={
                      <Text style={styles.termsText}>
                        I agree to the{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() => Linking.openURL("https://example.com/terms")}
                        >
                          Terms of Service
                        </Text>
                        {" "}and{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() => Linking.openURL("https://example.com/privacy")}
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    }
                  />
                )}
              />
            </View>

            {/* Submit Button */}
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={!isValid || loading}
              fullWidth
              className={styles.submitButton}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backLink}>Back to sign up options</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: 180,
    position: "relative",
  },
  heroGradient: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  circleDecoration: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 9999,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -50,
    right: 10,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -10,
    left: -30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 12,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  formSection: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  formDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: "#ef4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#111827",
    padding: 0,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  countryCodeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginRight: 12,
  },
  phoneInput: {
    marginLeft: 0,
  },
  toggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#374151",
    lineHeight: 20,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  termsLink: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  submitButton: {
    marginBottom: 24,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
});

