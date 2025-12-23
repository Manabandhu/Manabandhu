import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import {
  BriefcaseIcon,
  HomeIcon,
  CarIcon,
  CreditCardIcon,
  EyeIconPreview,
} from "@/components/ui/Icons";
import { GluestackSwitch } from "@/components/ui/gluestack-index";
import { GluestackButton } from "@/components/ui/gluestack-index";
import * as Haptics from "expo-haptics";

interface PriorityItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ size?: number; color?: string }>;
  gradient: string[];
  enabled: boolean;
}

const initialPriorities: PriorityItem[] = [
  {
    id: "jobs_career",
    title: "Jobs & Career",
    subtitle: "Latest opportunities",
    icon: BriefcaseIcon,
    gradient: ["#F59E0B", "#D97706"],
    enabled: true,
  },
  {
    id: "housing",
    title: "Housing",
    subtitle: "Apartments & rooms",
    icon: HomeIcon,
    gradient: ["#3B82F6", "#2563EB"],
    enabled: true,
  },
  {
    id: "transportation",
    title: "Rides & Transportation",
    subtitle: "Carpools & transit",
    icon: CarIcon,
    gradient: ["#10B981", "#059669"],
    enabled: false,
  },
  {
    id: "finance_banking",
    title: "Finance & Banking",
    subtitle: "Money management",
    icon: CreditCardIcon,
    gradient: ["#8B5CF6", "#7C3AED"],
    enabled: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [priorities, setPriorities] = useState<PriorityItem[]>(initialPriorities);

  const togglePriority = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPriorities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleComplete = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Save priorities to Firestore
      const { db, getCurrentUser } = await import("../../lib/firebase.js");
      const { doc, setDoc } = await import("firebase/firestore");
      const user = getCurrentUser();

      if (user) {
        const enabledPriorities = priorities
          .filter((p) => p.enabled)
          .map((p) => p.id);

        await setDoc(
          doc(db, "users", user.uid),
          {
            homepagePriorities: priorities.map((p) => ({
              id: p.id,
              enabled: p.enabled,
            })),
            enabledPriorities,
            onboardingCompleted: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      router.replace("/(onboarding)/done");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCustomizeLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(onboarding)/done");
  };

  const enabledPriorities = priorities.filter((p) => p.enabled);

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
            <Logo size={56} color="#FFFFFF" />

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Step 4 of 4</Text>
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBar}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Customize Your{"\n"}Homepage
            </Text>
            <Text style={styles.heroSubtitle}>
              Choose what you want to see first
            </Text>
          </View>
        </LinearGradient>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Set Your Priorities</Text>
            <Text style={styles.sectionSubtitle}>
              Toggle the sections you want to see first on your homepage
            </Text>
            <Text style={styles.sectionHelper}>
              {enabledPriorities.length > 0
                ? `${enabledPriorities.length} enabled`
                : "Pick at least one to get tailored updates"}
            </Text>
          </View>

          {/* Priority Cards */}
          <View style={styles.priorityCards}>
            {priorities.map((priority) => {
              const IconComponent = priority.icon;
              return (
                <View key={priority.id} style={styles.priorityCard}>
                  {/* Icon */}
                  <LinearGradient
                    colors={priority.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardIcon}
                  >
                    <IconComponent size={24} color="#FFFFFF" />
                  </LinearGradient>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{priority.title}</Text>
                    <Text style={styles.cardSubtitle}>{priority.subtitle}</Text>
                  </View>

                  {/* Toggle */}
                  <GluestackSwitch
                    isChecked={priority.enabled}
                    onToggle={() => togglePriority(priority.id)}
                  />
                </View>
              );
            })}
          </View>

          {/* Preview Section */}
          <View style={styles.previewSection}>
            <View style={styles.previewTitle}>
              <EyeIconPreview size={16} color="#6B7280" />
              <Text style={styles.previewTitleText}>
                Your homepage will show this content{"\n"}
                first
              </Text>
            </View>
            <View style={styles.previewBox}>
              {enabledPriorities.length > 0 ? (
                enabledPriorities.slice(0, 2).map((priority, index) => {
                  const IconComponent = priority.icon;
                  return (
                    <View key={priority.id} style={styles.previewItem}>
                      <LinearGradient
                            colors={priority.gradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.previewItemIcon}
                          >
                        <IconComponent size={16} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={styles.previewItemText}>
                        <Text style={styles.previewItemTitle}>
                          {priority.title}
                        </Text>
                        <Text style={styles.previewItemSubtitle}>
                          {index === 0 ? "Top section" : "Second section"}
                        </Text>
                      </View>
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>Priority</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.previewEmpty}>
                  Enable priorities to see preview
                </Text>
              )}
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <GluestackButton
              onPress={handleComplete}
              fullWidth
            >
              Complete Setup
            </GluestackButton>
            <TouchableOpacity onPress={handleCustomizeLater}>
              <Text style={styles.secondaryLink}>I'll customize later</Text>
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
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  circleDecoration1: {
    position: "absolute",
    top: -50,
    right: -10,
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
  progressContainer: {
    width: "100%",
    marginTop: 16,
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  progressBarWrapper: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    width: "100%",
    height: "100%",
  },
  progressBarFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  contentSection: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6B7280",
  },
  sectionHelper: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  priorityCards: {
    gap: 16,
    marginBottom: 32,
  },
  priorityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
  previewSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  previewTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  previewTitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    lineHeight: 20,
  },
  previewBox: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    minHeight: 106,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  previewItemText: {
    flex: 1,
  },
  previewItemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  previewItemSubtitle: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  previewBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4F46E5",
  },
  previewEmpty: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
  ctaSection: {
    gap: 16,
    marginBottom: 24,
  },
  secondaryLink: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
  },
});
