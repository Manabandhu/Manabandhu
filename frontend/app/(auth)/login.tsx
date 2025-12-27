import React, { useState, useEffect, useRef } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { loginSchema, LoginInput } from "@/lib/validators";
import { GluestackInput } from "@/components/ui/gluestack-index";
import { GluestackButton } from "@/components/ui/gluestack-index";
import { GluestackCheckbox } from "@/components/ui/gluestack-index";
import { Logo } from "@/components/ui/Logo";
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon, AppleIcon, PhoneIcon, FingerprintIcon } from "@/components/ui/Icons";
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
import { checkBiometricAvailability, authenticateWithBiometric, BiometricType } from "@/lib/biometric";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState<BiometricType>({ available: false, type: "none", name: "" });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [checkingBiometric, setCheckingBiometric] = useState(true);
  const biometricPromptedRef = useRef(false);
  const { setUser } = useAuthStore();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const initializeBiometric = async () => {
      try {
        // Check biometric availability
        const biometric = await checkBiometricAvailability();
        setBiometricAvailable(biometric);
        
        // Check if biometric is enabled
        const biometricEnabled = await secureStorage.getItem('biometric_enabled');
        setBiometricEnabled(biometricEnabled === 'true');
      } catch (error) {
        console.log('Error checking biometric:', error);
      } finally {
        setCheckingBiometric(false);
      }
    };

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
    
    initializeBiometric();
    loadSavedCredentials();
  }, []);

  // Auto-prompt for biometric if enabled and credentials are saved
  useEffect(() => {
    const autoBiometricLogin = async () => {
      if (checkingBiometric || loading || biometricPromptedRef.current) return;
      
      const savedEmail = await secureStorage.getItem('remembered_email');
      const savedPassword = await secureStorage.getItem('remembered_password');
      const wasRemembered = await secureStorage.getItem('remember_me');
      const biometricEnabled = await secureStorage.getItem('biometric_enabled');
      
      if (
        biometricAvailable.available &&
        biometricEnabled === 'true' &&
        wasRemembered === 'true' &&
        savedEmail &&
        savedPassword
      ) {
        biometricPromptedRef.current = true;
        // Small delay to let the UI render first
        setTimeout(async () => {
          await handleBiometricLogin();
        }, 500);
      }
    };

    if (!checkingBiometric) {
      autoBiometricLogin();
    }
  }, [checkingBiometric, biometricAvailable.available, loading]);

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
          
          // Prompt to enable biometric if available and not already enabled
          if (biometricAvailable.available && !biometricEnabled) {
            // You could show a prompt here asking if user wants to enable biometric
            // For now, we'll auto-enable it if they have remember me checked
            await secureStorage.setItem('biometric_enabled', 'true');
            setBiometricEnabled(true);
          }
        } else {
          // Clear saved credentials if remember me is unchecked
          await secureStorage.removeItem('remembered_email');
          await secureStorage.removeItem('remembered_password');
          await secureStorage.removeItem('remember_me');
          await secureStorage.removeItem('biometric_enabled');
          setBiometricEnabled(false);
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

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Authenticate with biometric
      const result = await authenticateWithBiometric(
        `Sign in with ${biometricAvailable.name}`
      );

      if (!result.success) {
        if (result.error === "Authentication cancelled" || result.error === "user_fallback") {
          // User cancelled or chose to use password - don't show error
          setLoading(false);
          return;
        }
        throw new Error(result.error || "Biometric authentication failed");
      }

      // Get saved credentials
      const savedEmail = await secureStorage.getItem('remembered_email');
      const savedPassword = await secureStorage.getItem('remembered_password');

      if (!savedEmail || !savedPassword) {
        throw new Error("No saved credentials found");
      }

      // Sign in with saved credentials
      const sanitizedEmail = sanitizeEmail(savedEmail);
      const signInResult = await signInWithEmail(sanitizedEmail, savedPassword);
      const user = signInResult.user;

      if (user) {
        await navigateAfterAuth();
      }
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Biometric login failed", {}, error);
      // Don't show error to user for biometric failures, just fall back to manual login
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
          style={[styles.heroSection, { paddingTop: Math.max(insets.top, 32) }]}
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

            {/* Biometric Login Button */}
            {biometricAvailable.available && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={loading || checkingBiometric}
              >
                <FingerprintIcon size={24} color="#4F46E5" />
                <Text style={styles.biometricButtonText}>
                  Sign in with {biometricAvailable.name}
                </Text>
              </TouchableOpacity>
            )}

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
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4F46E5",
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    gap: 12,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4F46E5",
  },
});
