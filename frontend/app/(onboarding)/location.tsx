import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import {
  MapPinIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import { GluestackButton } from "@/components/ui/gluestack-index";
import { requestLocationPermission } from "@/lib/permissions";
import * as Haptics from "expo-haptics";
import { GRADIENTS } from "@/constants/colors";
import Svg, { Rect, Line, Path, Circle, G } from "react-native-svg";

const benefits = [
  {
    id: "nearby_services",
    text: "Find nearby services",
    icon: MapPinIcon,
  },
  {
    id: "location_deals",
    text: "Location-specific deals",
    icon: ShoppingBagIcon,
  },
  {
    id: "community_events",
    text: "Community events near you",
    icon: UsersIcon,
  },
];

export default function LocationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnableLocation = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const granted = await requestLocationPermission();
      if (granted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.push("/(onboarding)/notifications");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterManually = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/notifications");
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/notifications");
  };

  const handlePrivacyPolicy = () => {
    // Open privacy policy link
    Linking.openURL("https://manabandhu.com/privacy");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroContent}>
            <Logo size={70} color="#FFFFFF" />

            {/* Progress Bar */}
            <View style={styles.progressWrapper}>
              <View style={styles.progressBar}>
                <View style={[styles.progressStep, styles.progressStepActive]} />
                <View style={[styles.progressStep, styles.progressStepActive]} />
                <View style={[styles.progressStep, styles.progressStepActive]} />
                <View style={styles.progressStep} />
              </View>
              <Text style={styles.progressText}>Step 3 of 4</Text>
            </View>

            <Text style={styles.heroTitle}>Enable Location</Text>
            <Text style={styles.heroSubtitle}>
              Get personalized recommendations based on{"\n"}
              your location
            </Text>
          </View>
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Map Illustration */}
          <View style={styles.illustrationContainer}>
            <Svg width={220} height={165} viewBox="0 0 240 180">
              {/* Background */}
              <Rect x="10" y="10" width="220" height="160" rx="12" fill="#E0E7FF" />
              
              {/* Grid lines */}
              <Line x1="10" y1="50" x2="230" y2="50" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2,2" />
              <Line x1="10" y1="90" x2="230" y2="90" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2,2" />
              <Line x1="10" y1="130" x2="230" y2="130" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2,2" />
              <Line x1="70" y1="10" x2="70" y2="170" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2,2" />
              <Line x1="120" y1="10" x2="120" y2="170" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2,2" />
              <Line x1="170" y1="10" x2="170" y2="170" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Curved path */}
              <Path d="M10 60 Q60 80 120 60 T230 80" stroke="#A5B4FC" strokeWidth="4" fill="none" strokeLinecap="round" />
              <Line x1="80" y1="10" x2="80" y2="170" stroke="#A5B4FC" strokeWidth="4" strokeLinecap="round" />
              
              {/* Buildings */}
              <Rect x="30" y="30" width="25" height="30" rx="4" fill="#818CF8" />
              <Rect x="130" y="100" width="30" height="35" rx="4" fill="#6366F1" />
              <Rect x="180" y="40" width="28" height="40" rx="4" fill="#4F46E5" />
              
              {/* Location pins */}
              <G transform="translate(120, 90)">
                <Path d="M0 -20 C-8 -20 -15 -13 -15 -5 C-15 8 0 20 0 20 C0 20 15 8 15 -5 C15 -13 8 -20 0 -20 Z" fill="#4F46E5" />
                <Circle cx="0" cy="-5" r="5" fill="#FFFFFF" />
              </G>
              
              <G transform="translate(60, 50)">
                <Path d="M0 -12 C-5 -12 -9 -8 -9 -3 C-9 5 0 12 0 12 C0 12 9 5 9 -3 C9 -8 5 -12 0 -12 Z" fill="#6366F1" opacity="0.7" />
                <Circle cx="0" cy="-3" r="3" fill="#FFFFFF" />
              </G>
              
              <G transform="translate(190, 120)">
                <Path d="M0 -12 C-5 -12 -9 -8 -9 -3 C-9 5 0 12 0 12 C0 12 9 5 9 -3 C9 -8 5 -12 0 -12 Z" fill="#6366F1" opacity="0.7" />
                <Circle cx="0" cy="-3" r="3" fill="#FFFFFF" />
              </G>
              
              {/* Circles */}
              <Circle cx="200" cy="30" r="15" fill="#BFDBFE" opacity="0.5" />
              <Circle cx="40" cy="140" r="10" fill="#BFDBFE" opacity="0.5" />
            </Svg>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <View key={benefit.id} style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <IconComponent size={20} color="#4F46E5" />
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              );
            })}
          </View>

          {/* Permission Box */}
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>
              We respect your privacy. Location is only used{"\n"}
              to enhance your experience and is not shared{"\n"}
              without explicit consent.
            </Text>
            <TouchableOpacity onPress={handlePrivacyPolicy}>
              <Text style={styles.privacyLink}>Read our privacy policy →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Text style={styles.ctaNote}>
            You can update location permissions anytime in Settings.
          </Text>
          <View style={styles.buttonContainer}>
            <GluestackButton
              onPress={handleEnableLocation}
              isLoading={loading}
              fullWidth
            >
              Enable Location
            </GluestackButton>
            <TouchableOpacity
              style={styles.manualButton}
              onPress={handleEnterManually}
              activeOpacity={0.8}
            >
              <Text style={styles.manualButtonText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipLink}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: "center",
  },
  progressWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressStepActive: {
    backgroundColor: "#FFFFFF",
  },
  progressText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.13,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.48,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  contentArea: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  benefitsList: {
    marginBottom: 32,
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },
  permissionBox: {
    marginBottom: 24,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  privacyLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#F9FAFB",
    gap: 16,
  },
  ctaNote: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  manualButton: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  manualButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  skipLink: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
});
