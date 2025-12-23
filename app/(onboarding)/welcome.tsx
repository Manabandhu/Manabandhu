import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import { UserIcon, GlobeIcon, ChevronDownIcon, CheckIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { profileSchema, ProfileInput } from "@/lib/validators";
import * as Haptics from "expo-haptics";
import { COUNTRY_LIST, DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { GRADIENTS } from "@/constants/colors";

const purposes = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Professional" },
  { value: "family_member", label: "Family Member" },
  { value: "tourist", label: "Tourist" },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      country: DEFAULT_COUNTRY,
      city: "",
      role: undefined,
    },
  });

  const country = watch("country");

  const togglePurpose = (purpose: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPurposes((prev) =>
      prev.includes(purpose)
        ? prev.filter((p) => p !== purpose)
        : [...prev, purpose]
    );
  };

  const handleContinue = async (data: ProfileInput) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Map purposes to role (use first selected purpose as primary role)
      const role = selectedPurposes[0] || "visitor";
      
      // Update form with role
      const formData = {
        ...data,
        role: role as "student" | "worker" | "visitor",
      };

      // Save to Firestore
      const { db, getCurrentUser } = await import("@/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      const user = getCurrentUser();

      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            displayName: formData.displayName,
            country: formData.country,
            city: formData.city,
            role: formData.role,
            purposes: selectedPurposes,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      router.push("/(onboarding)/goals");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/goals");
  };

  const isFormValid = watch("displayName") && watch("country");

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
                <View style={styles.progressStep} />
                <View style={styles.progressStep} />
                <View style={styles.progressStep} />
              </View>
              <Text style={styles.progressText}>Step 1 of 4</Text>
            </View>

            <Text style={styles.heroTitle}>Welcome to ManaBandhu!</Text>
            <Text style={styles.heroSubtitle}>
              Let's personalize your experience
            </Text>
          </View>
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Full Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <View
                    style={[
                      styles.inputWrapper,
                      error && styles.inputWrapperError,
                    ]}
                  >
                    <View style={styles.inputIcon}>
                      <UserIcon size={20} color="#6B7280" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Country Select */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Country</Text>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      styles.selectWrapper,
                      error && styles.inputWrapperError,
                    ]}
                    onPress={() => {
                      setShowCountryModal(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={styles.inputIcon}>
                      <GlobeIcon size={20} color="#6B7280" />
                    </View>
                    <Text
                      style={[
                        styles.selectText,
                        !value && styles.selectPlaceholder,
                      ]}
                    >
                      {value || "Select your country"}
                    </Text>
                    <View style={styles.dropdownIcon}>
                      <ChevronDownIcon size={20} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                  <CountryModal
                    visible={showCountryModal}
                    onClose={() => setShowCountryModal(false)}
                    onSelect={(countryName) => {
                      onChange(countryName);
                      setShowCountryModal(false);
                    }}
                    selectedCountry={value}
                  />
                </View>
              )}
            />
          </View>

          {/* Purpose Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.purposeLabel}>
              I am here as a (select all that apply)
            </Text>
            <View style={styles.purposeGrid}>
              {purposes.map((purpose) => {
                const isSelected = selectedPurposes.includes(purpose.value);
                return (
                  <TouchableOpacity
                    key={purpose.value}
                    style={[
                      styles.purposePill,
                      isSelected && styles.purposePillSelected,
                    ]}
                    onPress={() => togglePurpose(purpose.value)}
                  >
                    <Text
                      style={[
                        styles.purposePillText,
                        isSelected && styles.purposePillTextSelected,
                      ]}
                    >
                      {purpose.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipLink}>Skip for now</Text>
          </TouchableOpacity>
          <Button
            title="Continue"
            onPress={handleSubmit(handleContinue)}
            disabled={!isFormValid}
            fullWidth
          />
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
    backgroundColor: "#4F46E5",
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
    backgroundColor: "#F2F2F2",
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },
  selectWrapper: {
    justifyContent: "space-between",
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },
  selectPlaceholder: {
    color: "#9CA3AF",
  },
  dropdownIcon: {
    marginLeft: 12,
  },
  purposeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  purposeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  purposePill: {
    width: "47%",
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  purposePillSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  purposePillText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  purposePillTextSelected: {
    color: "#4F46E5",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 8,
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#F2F2F2",
    gap: 16,
  },
  skipLink: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalClose: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 24,
    color: "#6B7280",
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemSelected: {
    backgroundColor: "#F9FAFB",
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },
  modalItemTextSelected: {
    fontWeight: "600",
    color: "#4F46E5",
  },
});

interface CountryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: string) => void;
  selectedCountry?: string;
}

const CountryModal: React.FC<CountryModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountry,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {COUNTRY_LIST.map((countryName) => (
              <TouchableOpacity
                key={countryName}
                style={[
                  styles.modalItem,
                  selectedCountry === countryName && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(countryName);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedCountry === countryName &&
                      styles.modalItemTextSelected,
                  ]}
                >
                  {countryName}
                </Text>
                {selectedCountry === countryName && (
                  <CheckIcon size={16} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
