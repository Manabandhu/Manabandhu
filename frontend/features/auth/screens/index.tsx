import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Linking, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
import { Logo } from "@/shared/components/ui/Logo";
import { EmailIcon } from "@/shared/components/ui/Icons";
import { GluestackButton } from "@/shared/components/ui/gluestack-index";
import { signInWithGoogle, signInWithApple } from "@/services/auth";
import { useAuthStore } from "@/store/auth.store";
import { GRADIENTS } from "@/shared/constants";
import { ROUTES } from "@/shared/constants/routes";
import { navigateAfterAuth } from "@/lib/navigation";
import * as Haptics from "expo-haptics";

export default function AuthIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await signInWithGoogle();
      await navigateAfterAuth();
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
      await signInWithApple();
      await navigateAfterAuth();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.auth.signup);
  };

  const handlePhoneSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.auth.verifyPhone);
  };

  // Facebook sign-in not wired yet; hide button in UI instead of showing a TODO

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
        <View style={[styles.heroSection, { paddingTop: Math.max(insets.top, 0) }]}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0.09, y: 0.21 }}
            end={{ x: 0.91, y: 0.79 }}
            style={styles.heroGradient}
          >
            {/* Circle Decorations */}
            <View style={[styles.circleDecoration, styles.circle1]} />
            <View style={[styles.circleDecoration, styles.circle2]} />
            <View style={[styles.circleDecoration, styles.circle3]} />

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <Logo size={70} />
              <Text style={styles.heroTitle}>Join ManaBandhu</Text>
              <Text style={styles.heroSubtitle}>Connect with your community</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeader}>Get Started</Text>

            {/* Email Sign Up Button */}
            <View style={styles.primaryAction}>
              <GluestackButton
                onPress={handleEmailSignUp}
                fullWidth
                size="lg"
                leftIcon={<EmailIcon size={20} color="#f9fafb" />}
              >
                Sign up with Email
              </GluestackButton>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <SocialLoginButtons
              onGooglePress={async () => handleGoogleSignIn()}
              onApplePress={async () => handleAppleSignIn()}
              onPhonePress={async () => handlePhoneSignUp()}
              loading={loading}
            />

            {/* Terms Text */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
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

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push(ROUTES.auth.login)}>
                <Text style={styles.signInLink}>Sign in</Text>
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
    height: 250,
    position: "relative",
  },
  heroGradient: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  circleDecoration: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
  },
  circle3: {
    width: 120,
    height: 120,
    top: 125,
    left: -60,
    opacity: 0.05,
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
    marginTop: 16,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  formSection: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  primaryAction: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  termsText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  termsLink: {
    color: "#4f46e5",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4b5563",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
});
