import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { emailSchema, EmailInput } from "@/lib/validators";
import { GluestackInput } from '@/shared/components/ui/gluestack-index";
import { GluestackButton } from '@/shared/components/ui/gluestack-index";
import { Logo } from '@/shared/components/ui/Logo";
import { EmailIcon, PhoneIcon, HelpIcon } from '@/shared/components/ui/Icons";
import { resetPassword } from "@/lib/firebase";
import * as Haptics from "expo-haptics";
import { GRADIENTS } from '@/shared/constants";
import { ROUTES } from '@/shared/constants/routes";
import { getFirebaseErrorMessage, normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizeEmail } from "@/lib/sanitize";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: EmailInput) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const sanitizedEmail = sanitizeEmail(data.email);
      await resetPassword(sanitizedEmail);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to check email screen
      router.push({
        pathname: ROUTES.auth.checkEmail,
        params: { email: sanitizedEmail },
      });
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Password reset failed", { email: data.email }, error);
      form.setError("email", {
        message: appError.userMessage || getFirebaseErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.auth.verifyPhone);
  };


  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.auth.login);
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
            <Text style={styles.heroTitle}>Reset Password</Text>
            <Text style={styles.heroSubtitle}>
              We'll help you get back in
            </Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            {/* Description */}
            <Text style={styles.description}>
              Enter your email address and we'll send you{"\n"}
              instructions to reset your password.
            </Text>

            {/* Email Input */}
            <Controller
              control={form.control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <GluestackInput
                  label="Email Address"
                  placeholder="Email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  floatingLabel
                  leftElement={<EmailIcon size={20} color="#868E96" />}
                />
              )}
            />

            {/* Send Reset Link Button */}
            <GluestackButton
              onPress={form.handleSubmit(handleSubmit)}
              isLoading={loading}
              fullWidth
              className="mb-6"
            >
              Send Reset Link
            </GluestackButton>

            {/* Alternative Methods */}
            <View style={styles.alternativeMethods}>
              <View style={styles.alternativeText}>
                <View style={styles.dividerLine} />
                <Text style={styles.alternativeTextLabel}>Or reset via</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.alternativeButtons}>
                <TouchableOpacity
                  style={styles.alternativeButton}
                  onPress={handlePhoneReset}
                >
                  <PhoneIcon size={18} color="#495057" />
                  <Text style={styles.alternativeButtonText}>Phone Number</Text>
                </TouchableOpacity>

                {/* Security questions flow not implemented - hidden for now */}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password?</Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
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
  description: {
    fontSize: 16,
    fontWeight: "400",
    color: "#495057",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  alternativeMethods: {
    marginTop: 24,
  },
  alternativeText: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9ECEF",
  },
  alternativeTextLabel: {
    fontSize: 14,
    color: "#868E96",
    fontWeight: "400",
    marginHorizontal: 16,
  },
  alternativeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  alternativeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 14,
    gap: 8,
  },
  alternativeButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#495057",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: "auto",
    paddingTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: "#6C757D",
    fontWeight: "400",
  },
  signinLink: {
    fontSize: 15,
    color: "#4F46E5",
    fontWeight: "600",
  },
});

