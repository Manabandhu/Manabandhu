import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/shared/components/ui/Logo";
import { EmailIcon } from "@/shared/components/ui/Icons";
import { resetPassword } from "@/services/auth";
import * as Haptics from "expo-haptics";
import { GRADIENTS } from "@/shared/constants";
import { GluestackButton } from "@/shared/components/ui/gluestack-index";
import { normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizeEmail } from "@/lib/sanitize";
import { TIMING } from "@/shared/constants/timing";

export default function CheckEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [resendTimer, setResendTimer] = useState<number>(TIMING.OTP_RESEND_COOLDOWN_EMAIL);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const email = params.email || "john@example.com";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev: any) => prev - 1), 1000);
      setCanResend(false);
    } else {
      setCanResend(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendTimer]);

  const handleOpenEmailApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const emailUrl = `mailto:${email}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        // Fallback: try to open mail app
        await Linking.openURL("mailto:");
      }
    } catch (error) {
      console.error("Error opening email app:", error);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || resending) return;

    try {
      setResending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const sanitizedEmail = sanitizeEmail(email);
      await resetPassword(sanitizedEmail);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset timer
      setResendTimer(TIMING.OTP_RESEND_COOLDOWN_EMAIL);
      setCanResend(false);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Resend email failed", { email }, error);
      // Could show error toast here with appError.userMessage
    } finally {
      setResending(false);
    }
  };

  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
            <Text style={styles.heroTitle}>Check Your Email</Text>
          </View>
        </LinearGradient>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.confirmationCard}>
            {/* Mail Icon */}
            <View style={styles.mailIconContainer}>
              <EmailIcon size={32} color="#4F46E5" />
            </View>

            {/* Primary Message */}
            <Text style={styles.messagePrimary}>
              We sent a password reset link to{"\n"}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            {/* Secondary Message */}
            <Text style={styles.messageSecondary}>
              The link will expire in {TIMING.PASSWORD_RESET_EXPIRY_MINUTES} minutes
            </Text>

            {/* Open Email App Button */}
            <View style={styles.buttonContainer}>
              <GluestackButton onPress={handleOpenEmailApp} fullWidth size="lg">
                Open Email App
              </GluestackButton>
            </View>

            {/* Resend Email Button */}
            <TouchableOpacity
              style={[
                styles.resendButton,
                (!canResend || resending) && styles.resendButtonDisabled,
              ]}
              onPress={handleResendEmail}
              disabled={!canResend || resending}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  (!canResend || resending) && styles.resendButtonTextDisabled,
                ]}
              >
                {resending ? "Sending..." : "Resend Email"}
              </Text>
            </TouchableOpacity>

            {/* Timer Text */}
            {!canResend && (
              <Text style={styles.timerText}>
                You can resend in{" "}
                <Text style={styles.countdown}>{formatTimer(resendTimer)}</Text>
              </Text>
            )}

            {/* Footer Link */}
            <TouchableOpacity onPress={handleTryAgain} style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Wrong email? Try again</Text>
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
    minHeight: 260,
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
    textAlign: "center",
  },
  contentSection: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#F8F9FA",
    flex: 1,
  },
  confirmationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  mailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  messagePrimary: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  emailText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  messageSecondary: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 16,
  },
  resendButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  resendButtonTextDisabled: {
    color: "#ADB5BD",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 24,
  },
  countdown: {
    fontWeight: "400",
    color: "#6C757D",
  },
  footerLink: {
    marginTop: "auto",
  },
  footerLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4F46E5",
  },
});
