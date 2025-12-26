import React, { useState, useEffect } from "react";
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
import { loginSchema, LoginInput } from "@/lib/validators";
import { GluestackInput } from "@/components/ui/gluestack-index";
import { GluestackButton } from "@/components/ui/gluestack-index";
import { GluestackCheckbox } from "@/components/ui/gluestack-index";
import { Logo } from "@/components/ui/Logo";
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon, AppleIcon, PhoneIcon } from "@/components/ui/Icons";
import { signInWithEmail, signInWithGoogle, signInWithApple } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";
import { ROUTES } from "@/constants/routes";
import { GRADIENTS } from "@/constants";
import { navigateAfterAuth } from "@/lib/navigation";
import { getFirebaseErrorMessage, normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizeEmail } from "@/lib/sanitize";
import { secureStorage } from "@/lib/storage";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser } = useAuthStore();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await secureStorage.getItem('remembered_email');
        const savedPassword = await secureStorage.getItem('remembered_password');
        const wasRemembered = await secureStorage.getItem('remember_me');
        
        if (wasRemembered === 'true' && savedEmail) {
          form.setValue('email', savedEmail);
          if (savedPassword) {
            form.setValue('password', savedPassword);
          }
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Error loading saved credentials:', error);
      }
    };
    
    loadSavedCredentials();
  }, []);

  const handleSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const sanitizedEmail = sanitizeEmail(data.email);
      const result = await signInWithEmail(sanitizedEmail, data.password);
      const user = result.user;

      if (user) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          await secureStorage.setItem('remembered_email', sanitizedEmail);
          await secureStorage.setItem('remembered_password', data.password);
          await secureStorage.setItem('remember_me', 'true');
        } else {
          // Clear saved credentials if remember me is unchecked
          await secureStorage.removeItem('remembered_email');
          await secureStorage.removeItem('remembered_password');
          await secureStorage.removeItem('remember_me');
        }
        
        await navigateAfterAuth();
      }
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Login failed", { email: data.email }, error);
      form.setError("password", {
        message: appError.userMessage || getFirebaseErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await signInWithGoogle();
      await navigateAfterAuth();
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Google sign-in failed", {}, error);
      // Could show error toast here
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await signInWithApple();
      await navigateAfterAuth();
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Apple sign-in failed", {}, error);
      // Could show error toast here
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Facebook sign in implementation
  };

  const handlePhoneSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.auth.verifyPhone);
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.auth.resetPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: "#F2F2F2" }}
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
            <Logo size={80} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Welcome back</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to your ManaBandhu account
            </Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            {/* Email Input */}
            <Controller
              control={form.control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <GluestackInput
                  label="Email"
                  placeholder="Email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  floatingLabel
                  leftElement={<EmailIcon size={20} color="#6B7280" />}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={form.control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <GluestackInput
                  label="Password"
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  floatingLabel
                  leftElement={<LockIcon size={20} color="#6B7280" />}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => {
                        setShowPassword(!showPassword);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      {showPassword ? (
                        <EyeOffIcon size={20} color="#6B7280" />
                      ) : (
                        <EyeIcon size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  }
                />
              )}
            />

            {/* Options Row */}
            <View style={styles.optionsRow}>
              <GluestackCheckbox
                isChecked={rememberMe}
                onChange={(checked) => {
                  setRememberMe(checked);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                label={<Text style={styles.rememberText}>Remember me</Text>}
              />
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <GluestackButton
              onPress={form.handleSubmit(handleSubmit)}
              isLoading={loading}
              fullWidth
              className="mt-2"
            >
              Sign in
            </GluestackButton>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon size={20} />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
                disabled={loading}
              >
                <FacebookIcon size={20} color="#FFFFFF" />
                <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
                  Continue with Facebook
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
                disabled={loading}
              >
                <AppleIcon size={20} color="#FFFFFF" />
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.phoneButton]}
                onPress={handlePhoneSignIn}
                disabled={loading}
              >
                <PhoneIcon size={20} color="#000000" />
                <Text style={styles.socialButtonText}>Continue with Phone Number</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(ROUTES.auth.signup);
                }}
              >
                <Text style={styles.signupLink}>Sign up</Text>
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
    minHeight: 280,
    overflow: "hidden",
  },
  circleDecoration1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circleDecoration2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formSection: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#F2F2F2",
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "400",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
    marginHorizontal: 16,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    borderColor: "#1877F2",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  phoneButton: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  facebookButtonText: {
    color: "#FFFFFF",
  },
  appleButtonText: {
    color: "#FFFFFF",
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
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "400",
  },
  signupLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
});
