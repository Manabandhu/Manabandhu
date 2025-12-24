import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import {
  SearchIcon,
  UsersIcon,
  BellIcon,
} from "@/components/ui/Icons";
import { GluestackButton } from "@/components/ui/gluestack-index";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";
import { onboardingApi } from "@/lib/api";
import Svg, { Circle, Polyline } from "react-native-svg";

const tips = [
  {
    id: "marketplace",
    heading: "Explore the marketplace",
    description:
      "Browse jobs, housing, services, and more tailored to your community",
    icon: SearchIcon,
  },
  {
    id: "community",
    heading: "Connect with your community",
    description: "Find and connect with people from your country and culture",
    icon: UsersIcon,
  },
  {
    id: "notifications",
    heading: "Stay updated with notifications",
    description:
      "Get real-time alerts for new opportunities and community updates",
    icon: BellIcon,
  },
];

export default function DoneScreen() {
  const router = useRouter();
  const { setOnboardingCompleted, updateUserProfile } = useAuthStore();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const successIconOpacity = useRef(new Animated.Value(0)).current;
  const successIconScale = useRef(new Animated.Value(0)).current;
  const checkmarkProgress = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const tipsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        const result = await onboardingApi.updateOnboarding({
          onboardingCompleted: true,
        });
        console.log('Onboarding completed:', result);
        setOnboardingCompleted(true);
      } catch (error) {
        console.error("Error completing onboarding:", error);
      }
    };

    completeOnboarding();

    // Animate logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Animate success icon
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(successIconOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(successIconScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkmarkProgress, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tipsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [setOnboardingCompleted, updateUserProfile]);

  const handleExplore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(tabs)/home");
  };

  const handleTour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to tour/walkthrough screen if exists, otherwise go to home
    router.replace("/(tabs)/home");
  };

  return (
    <LinearGradient
      colors={["#6366F1", "#4F46E5", "#4338CA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative Circles */}
      <View style={styles.circleDecoration1} />
      <View style={styles.circleDecoration2} />
      <View style={styles.circleDecoration3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity }]}>
          <Logo size={64} color="#FFFFFF" />
        </Animated.View>

        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIconWrapper,
            {
              opacity: successIconOpacity,
              transform: [{ scale: successIconScale }],
            },
          ]}
        >
          <Svg width={90} height={90} viewBox="0 0 90 90">
            <Circle
              cx="45"
              cy="45"
              r="42"
              fill="#FFFFFF"
              opacity={1}
            />
            <Animated.View
              style={{
                opacity: checkmarkProgress,
              }}
            >
              <Polyline
                points="25 45 40 60 65 35"
                stroke="#4F46E5"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Animated.View>
          </Svg>
        </Animated.View>

        {/* Success Content */}
        <Animated.View
          style={[styles.successContent, { opacity: contentOpacity }]}
        >
          <Text style={styles.successTitle}>You're All Set!</Text>
          <Text style={styles.successSubtitle}>
            Welcome to the ManaBandhu{"\n"}
            community
          </Text>
        </Animated.View>

        {/* Tips Card */}
        <Animated.View style={[styles.tipsCard, { opacity: tipsOpacity }]}>
          <Text style={styles.tipsTitle}>Quick Tips to Get Started</Text>
          <View style={styles.tipsList}>
            {tips.map((tip) => {
              const IconComponent = tip.icon;
              return (
                <View key={tip.id} style={styles.tipItem}>
                  <LinearGradient
                    colors={["#6366F1", "#4F46E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tipIcon}
                  >
                    <IconComponent size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.tipText}>
                    <Text style={styles.tipHeading}>{tip.heading}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* CTA Container */}
        <Animated.View
          style={[styles.ctaContainer, { opacity: buttonsOpacity }]}
        >
          <GluestackButton onPress={handleExplore} fullWidth size="lg">
            Explore ManaBandhu
          </GluestackButton>
          <GluestackButton onPress={handleTour} fullWidth size="lg" variant="outline">
            Take a Quick Tour
          </GluestackButton>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  circleDecoration1: {
    position: "absolute",
    top: -100,
    right: -10,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  circleDecoration2: {
    position: "absolute",
    bottom: -200,
    left: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  circleDecoration3: {
    position: "absolute",
    top: 200,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  logoWrapper: {
    marginBottom: 32,
  },
  successIconWrapper: {
    width: 90,
    height: 90,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  successContent: {
    alignItems: "center",
    marginBottom: 48,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 27,
  },
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  tipsList: {
    gap: 24,
  },
  tipItem: {
    flexDirection: "row",
    gap: 16,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
  },
  tipHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 24,
  },
  tipDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 20,
  },
  ctaContainer: {
    width: "100%",
    gap: 16,
  },
});
