import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validators";
import { Logo } from "@/components/ui/Logo";
import { LockIcon, EyeIcon, EyeOffIcon, CheckIcon } from "@/components/ui/Icons";
import { confirmPasswordReset } from "@/lib/firebase";
import * as Haptics from "expo-haptics";
import { GRADIENTS } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { getFirebaseErrorMessage, normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";

interface PasswordRequirement {
  id: string;
  label: string;
  check: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    check: (pwd) => pwd.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    check: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "number",
    label: "One number",
    check: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: "special",
    label: "One special character",
    check: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return strength;
};

export default function NewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ oobCode?: string; mode?: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const requirementStatus = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      met: req.check(password),
    }));
  }, [password]);

  const allRequirementsMet = useMemo(() => {
    return requirementStatus.every((req) => req.met);
  }, [requirementStatus]);

  const passwordsMatch = useMemo(() => {
    return password === confirmPassword && confirmPassword.length > 0;
  }, [password, confirmPassword]);

  const isFormValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (data: ResetPasswordInput) => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const oobCode = params.oobCode || "";
      await confirmPasswordReset(oobCode, data.password);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(ROUTES.auth.passwordResetSuccess);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Password reset failed", { oobCode: params.oobCode }, error);
      form.setError("password", {
        message: appError.userMessage || getFirebaseErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(ROUTES.auth.login);
  };

  const getStrengthColor = (index: number): string => {
    if (index < passwordStrength) {
      if (passwordStrength === 1) return "#EF4444"; // Weak - red
      if (passwordStrength === 2) return "#F59E0B"; // Fair - orange
      if (passwordStrength === 3) return "#3B82F6"; // Good - blue
      return "#10B981"; // Strong - green
    }
    return "#E5E7EB"; // Default - gray
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          {/* Decorative circles */}
          <View style={styles.circleDecoration1} />
          <View style={styles.circleDecoration2} />

          <View style={styles.heroContent}>
            <Logo size={72} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Create New Password</Text>
            <Text style={styles.heroSubtitle}>Choose a strong password</Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            {/* Password Requirements Box */}
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password Requirements</Text>
              {requirementStatus.map((req) => (
                <View key={req.id} style={styles.requirementItem}>
                  <View
                    style={[
                      styles.requirementCheckbox,
                      req.met && styles.requirementCheckboxChecked,
                    ]}
                  >
                    {req.met && <CheckIcon size={10} color="#FFFFFF" />}
                  </View>
                  <Text
                    style={[
                      styles.requirementText,
                      req.met && styles.requirementTextMet,
                    ]}
                  >
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  form.formState.errors.password && styles.inputError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={20} color="#868E96" />
                </View>
                <View style={styles.inputContent}>
                  {password && password.length > 0 && (
                    <Text style={styles.floatingLabel}>New Password</Text>
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#868E96"
                    value={password}
                    onChangeText={(text) => form.setValue("password", text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                </View>
                <TouchableOpacity
                  style={styles.togglePassword}
                  onPress={() => {
                    setShowPassword(!showPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} color="#868E96" />
                  ) : (
                    <EyeIcon size={20} color="#868E96" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Strength Indicator */}
              <View style={styles.strengthIndicator}>
                <View style={styles.strengthBars}>
                  {[0, 1, 2, 3].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: getStrengthColor(index) },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  form.formState.errors.confirmPassword && styles.inputError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={20} color="#868E96" />
                </View>
                <View style={styles.inputContent}>
                  {confirmPassword && confirmPassword.length > 0 && (
                    <Text style={styles.floatingLabel}>Confirm New Password</Text>
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#868E96"
                    value={confirmPassword}
                    onChangeText={(text) => form.setValue("confirmPassword", text)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                </View>
                <TouchableOpacity
                  style={styles.togglePassword}
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon size={20} color="#868E96" />
                  ) : (
                    <EyeIcon size={20} color="#868E96" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Messages */}
            {form.formState.errors.password && (
              <Text style={styles.errorText}>
                {form.formState.errors.password.message}
              </Text>
            )}
            {form.formState.errors.confirmPassword && (
              <Text style={styles.errorText}>
                {form.formState.errors.confirmPassword.message}
              </Text>
            )}

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                (!isFormValid || loading) && styles.resetButtonDisabled,
              ]}
              onPress={form.handleSubmit(handleSubmit)}
              disabled={!isFormValid || loading}
            >
              <LinearGradient
                colors={
                  isFormValid && !loading
                    ? ["#4F46E5", "#6366F1"]
                    : ["#D1D5DB", "#D1D5DB"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetButtonGradient}
              >
                <Text
                  style={[
                    styles.resetButtonText,
                    (!isFormValid || loading) && styles.resetButtonTextDisabled,
                  ]}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity onPress={handleBackToSignIn} style={styles.footer}>
              <Text style={styles.backLink}>← Back to sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    position: "relative",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    minHeight: 270,
    overflow: "hidden",
  },
  circleDecoration1: {
    position: "absolute",
    top: -60,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circleDecoration2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 17,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
  },
  formSection: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#F8F9FA",
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  requirementsBox: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  requirementCheckboxChecked: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  requirementText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },
  requirementTextMet: {
    color: "#374151",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
    justifyContent: "center",
  },
  floatingLabel: {
    position: "absolute",
    top: -8,
    left: 0,
    fontSize: 14,
    fontWeight: "500",
    color: "#868E96",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 4,
  },
  input: {
    fontSize: 17,
    fontWeight: "500",
    color: "#495057",
    padding: 0,
    margin: 0,
  },
  togglePassword: {
    marginLeft: 12,
  },
  strengthIndicator: {
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginBottom: 16,
  },
  resetButton: {
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resetButtonTextDisabled: {
    color: "#FFFFFF",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
});

