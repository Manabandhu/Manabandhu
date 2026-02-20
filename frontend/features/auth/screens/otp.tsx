import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { OTPInput } from "@/shared/components/ui/OTPInput";
import { GluestackButton } from "@/shared/components/ui/gluestack-index";
import { Logo } from "@/shared/components/ui/Logo";
import { verifyOTP } from "@/services/auth";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Path } from "react-native-svg";
import { navigateAfterAuth } from "@/lib/navigation";
import { normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { TIMING } from "@/shared/constants/timing";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    verificationId?: string;
    phoneNumber?: string;
    email?: string;
    emailLink?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(TIMING.OTP_RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  

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

  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [showSuccess]);

  const formatPhoneNumber = (phone: string): string => {
    // Format phone number to (XXX) XXX-XXXX format
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned[0] === "1") {
      const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return phone;
  };

  const handleOTPChange = (otp: string) => {
    setOtpValue(otp);
  };

  const handleOTPComplete = async (otp: string) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (params.verificationId) {
        await verifyOTP(params.verificationId, otp);
      } else if (params.email && params.emailLink) {
        // Email link verification - needs to be implemented in auth service
        // For now, throw an error indicating this feature needs implementation
        throw new Error("Email link verification is not yet implemented");
      } else {
        throw new Error("No verification method provided");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);

      // Redirect after showing success
      setTimeout(async () => {
        await navigateAfterAuth();
      }, TIMING.OTP_SUCCESS_REDIRECT_DELAY);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("OTP verification failed", { verificationId: params.verificationId }, error);
      setLoading(false);
      // Could show error toast here with appError.userMessage
    }
  };

  const handleVerify = async () => {
    if (otpValue.length === 6) {
      await handleOTPComplete(otpValue);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    if (!params.phoneNumber) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setResendTimer(TIMING.OTP_RESEND_COOLDOWN);
      setCanResend(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { sendOTP } = await import("@/services/auth");
      const id = await sendOTP(params.phoneNumber);
      router.setParams({ verificationId: id });
    } catch (error) {
      setResendTimer(0);
      setCanResend(true);
      logger.error("OTP resend failed", { phoneNumber: params.phoneNumber }, error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleEditPhone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAlternativeMethod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const displayPhone = params.phoneNumber
    ? formatPhoneNumber(params.phoneNumber)
    : params.email || "+1 (555) 123-4567";

  const timerMinutes = Math.floor(resendTimer / 60);
  const timerSeconds = resendTimer % 60;

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
          colors={["#6366F1", "#4F46E5", "#4338CA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          {/* Decorative circles */}
          <View style={styles.circleDecoration1} />
          <View style={styles.circleDecoration2} />

          <View style={styles.heroContent}>
            <Logo size={64} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Enter Code</Text>
            <Text style={styles.heroSubtitle}>
              We've sent a verification code to your number
            </Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            {/* Phone Number Display */}
            <View style={styles.phoneDisplay}>
              <Text style={styles.phoneText}>
                Code sent to{" "}
                <Text style={styles.phoneNumber}>{displayPhone}</Text>
              </Text>
              {params.phoneNumber && (
                <TouchableOpacity onPress={handleEditPhone}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <OTPInput
                length={6}
                onComplete={handleOTPComplete}
                onChange={handleOTPChange}
                error={undefined}
              />
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend code in{" "}
                  <Text style={styles.timerCountdown}>
                    {timerMinutes}:{timerSeconds.toString().padStart(2, "0")}
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendButton}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <GluestackButton
              onPress={handleVerify}
              isLoading={loading}
              isDisabled={otpValue.length !== 6 || loading}
              fullWidth
              className="mt-6"
            >
              {loading ? "Verifying..." : "Verify"}
            </GluestackButton>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Didn't receive code?</Text>
              <TouchableOpacity onPress={handleAlternativeMethod}>
                <Text style={styles.alternativeLink}>Try another method</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <Svg width={80} height={80} viewBox="0 0 80 80" style={styles.successIcon}>
              <Circle cx="40" cy="40" r="36" fill="#10B981" opacity={0.1} />
              <Circle cx="40" cy="40" r="30" fill="#10B981" />
              <Path
                d="M25 40 L35 50 L55 30"
                stroke="#FFFFFF"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.successTitle}>Verified!</Text>
            <Text style={styles.successMessage}>
              Your phone number has been verified
            </Text>
          </Animated.View>
        </View>
      </Modal>
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
    minHeight: 200,
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
    fontSize: 24,
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
  phoneDisplay: {
    alignItems: "center",
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
    textAlign: "center",
  },
  phoneNumber: {
    fontWeight: "600",
    color: "#111827",
  },
  editLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
    marginLeft: 8,
  },
  otpContainer: {
    marginVertical: 16,
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  timerText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  timerCountdown: {
    fontWeight: "600",
    color: "#4F46E5",
  },
  resendButton: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  alternativeLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 48,
    alignItems: "center",
    maxWidth: 300,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    } : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 30,
      elevation: 10,
    }),
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
