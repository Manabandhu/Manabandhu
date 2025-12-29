import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import Svg, { Path, Circle } from "react-native-svg";
import { GluestackButton } from "@/components/ui/gluestack-index";
import * as Haptics from "expo-haptics";
import { GRADIENTS } from "@/constants";
import { ROUTES } from "@/constants/routes";

export default function PasswordResetSuccessScreen() {
  const router = useRouter();
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate icon scale and content fade in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(ROUTES.auth.login);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
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
            <Text style={styles.heroTitle}>Password Reset!</Text>
          </View>
        </LinearGradient>

        {/* Success Section */}
        <View style={styles.successSection}>
          <View style={styles.successCard}>
            {/* Success Icon */}
            <Animated.View
              style={[
                styles.successIconContainer,
                {
                  transform: [{ scale: scaleAnimation }],
                  opacity: checkmarkOpacity,
                },
              ]}
            >
              <Svg width={80} height={80} viewBox="0 0 32 32">
                <Circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="#10B981"
                  opacity={0.1}
                />
                <Circle cx="16" cy="16" r="12" fill="#10B981" />
                <Path
                  d="M8 16 L14 22 L24 10"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>

            {/* Success Messages */}
            <Animated.View
              style={[
                styles.messagesContainer,
                {
                  opacity: opacityAnimation,
                },
              ]}
            >
              <Text style={styles.successMessagePrimary}>
                Your password has been successfully{"\n"}
                reset
              </Text>
              <Text style={styles.successMessageSecondary}>
                You can now sign in with your new{"\n"}
                password
              </Text>
            </Animated.View>

            {/* Sign In Button */}
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: opacityAnimation,
                },
              ]}
            >
              <GluestackButton onPress={handleSignIn} fullWidth size="lg">
                Sign In
              </GluestackButton>
            </Animated.View>
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
  successSection: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#F8F9FA",
    flex: 1,
  },
  successCard: {
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
  successIconContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  messagesContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  successMessagePrimary: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  successMessageSecondary: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
  },
});
