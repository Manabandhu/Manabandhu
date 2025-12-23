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
  CompassIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  ActivityIcon,
  BookIcon,
  BusIcon,
  CalendarIcon,
  UtensilsIcon,
  FileIcon,
  MessageIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import { GluestackButton } from "@/components/ui/gluestack-index";
import * as Haptics from "expo-haptics";
import { GRADIENTS } from "@/constants/colors";

const interests = [
  { id: "jobs_career", title: "Jobs & Career", icon: BriefcaseIcon },
  { id: "housing", title: "Housing", icon: HomeIcon },
  { id: "immigration", title: "Immigration", icon: CompassIcon },
  { id: "shopping", title: "Shopping", icon: ShoppingBagIcon },
  { id: "finance_banking", title: "Finance & Banking", icon: DollarSignIcon },
  { id: "healthcare", title: "Healthcare", icon: ActivityIcon },
  { id: "education", title: "Education", icon: BookIcon },
  { id: "transportation", title: "Transportation", icon: BusIcon },
  { id: "events_community", title: "Events & Community", icon: CalendarIcon },
  { id: "food_dining", title: "Food & Dining", icon: UtensilsIcon },
  { id: "legal_services", title: "Legal Services", icon: FileIcon },
  { id: "language_learning", title: "Language Learning", icon: MessageIcon },
];

export default function GoalsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Save interests to Firestore
      const { db, getCurrentUser } = await import("../../lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      const user = getCurrentUser();

      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            interests: selectedInterests,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      router.push("/(onboarding)/location");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/location");
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
                <View style={styles.progressStep} />
                <View style={styles.progressStep} />
              </View>
              <Text style={styles.progressText}>Step 2 of 4</Text>
            </View>

            <Text style={styles.heroTitle}>What interests you?</Text>
            <Text style={styles.heroSubtitle}>Select all that apply</Text>
          </View>
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.contentArea}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tell us what to prioritize</Text>
            <Text style={styles.sectionSubtitle}>
              {selectedInterests.length > 0
                ? `${selectedInterests.length} selected`
                : "Pick a few so we can personalize your homepage"}
            </Text>
          </View>

          <View style={styles.interestGrid}>
            {interests.map((interest) => {
              const IconComponent = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);
              
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestCard,
                    isSelected && styles.interestCardSelected,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.interestIcon}>
                    <IconComponent size={28} color={isSelected ? "#4F46E5" : "#6B7280"} />
                  </View>
                  <Text
                    style={[
                      styles.interestLabel,
                      isSelected && styles.interestLabelSelected,
                    ]}
                  >
                    {interest.title}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <CheckIcon size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipLink}>Skip for now</Text>
          </TouchableOpacity>
          <GluestackButton
            onPress={handleContinue}
            isDisabled={selectedInterests.length === 0}
            fullWidth
          >
            Continue
          </GluestackButton>
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
  },
  contentArea: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestCard: {
    width: "47%",
    height: 120,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 20,
    paddingBottom: 16,
  },
  interestCardSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  interestIcon: {
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  interestLabelSelected: {
    color: "#4F46E5",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#F9FAFB",
    gap: 16,
  },
  skipLink: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
});
