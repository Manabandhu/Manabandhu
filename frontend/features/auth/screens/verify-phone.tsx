import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneSchema, PhoneInput } from "@/lib/validators";
import { Logo } from "@/shared/components/ui/Logo";
import { PhoneIcon } from "@/shared/components/ui/Icons";
import { GluestackButton } from "@/shared/components/ui/gluestack-index";
import { sendOTP } from "@/services/auth";
import { COLORS } from "@/shared/constants";
import { ROUTES } from "@/shared/constants/routes";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { getAuthErrorMessage, normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizePhone } from "@/lib/sanitize";

const { width } = Dimensions.get("window");

const InfoIcon = ({ size = 20, color = "#3b82f6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="12"
      y1="16"
      x2="12"
      y2="12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="12"
      y1="8"
      x2="12.01"
      y2="8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DropdownArrow = ({ size = 12, color = "#6b7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="6 9 12 15 18 9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type CountryCode = "US" | "IN" | "CA" | "GB";

type Country = {
  cca2: CountryCode;
  callingCode: [string];
  name: string;
  flag: string;
};

const COUNTRY_OPTIONS: Country[] = [
  { cca2: "US", callingCode: ["1"], name: "United States", flag: "🇺🇸" },
  { cca2: "IN", callingCode: ["91"], name: "India", flag: "🇮🇳" },
  { cca2: "CA", callingCode: ["1"], name: "Canada", flag: "🇨🇦" },
  { cca2: "GB", callingCode: ["44"], name: "United Kingdom", flag: "🇬🇧" },
];

const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>(DEFAULT_COUNTRY.cca2);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
      countryCode: "+1",
    },
  });

  const onSelectCountry = (selectedCountry: Country) => {
    setCountry(selectedCountry);
    setCountryCode(selectedCountry.cca2);
    setValue('countryCode', `+${selectedCountry.callingCode[0]}`);
    setShowCountryPicker(false);
  };

  const onSubmit = async (data: PhoneInput) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const sanitizedPhone = sanitizePhone(data.phoneNumber);
      const fullPhoneNumber = `${data.countryCode}${sanitizedPhone}`;
            const verificationId = await sendOTP(fullPhoneNumber);

      router.push({
        pathname: ROUTES.auth.otp,
        params: { verificationId, phoneNumber: fullPhoneNumber },
      });
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      logger.error("Send OTP error", { phoneNumber: data.phoneNumber }, error);
      // Could show error toast here with appError.userMessage
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#6366f1", "#4f46e5", "#4338ca"]}
            start={{ x: 0.09, y: 0.21 }}
            end={{ x: 0.91, y: 0.79 }}
            style={styles.heroGradient}
          >
            {/* Circle Decorations */}
            <View style={[styles.circleDecoration, styles.circle1]} />
            <View style={[styles.circleDecoration, styles.circle2]} />

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <Logo size={60} />
              <Text style={styles.heroTitle}>Verify Phone</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContentWrapper}>
            <Text style={styles.formDescription}>Enter your mobile number</Text>
            <Text style={styles.formHint}>We'll send a 6-digit verification code</Text>

            {/* Phone Input */}
            <View style={styles.phoneInputGroup}>
              <View
                style={[
                  styles.phoneInputWrapper,
                  errors.phoneNumber && styles.inputWrapperError,
                ]}
              >
                {/* Country Code Selector */}
                <TouchableOpacity 
                  style={styles.countryCodeSelector}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.flagIcon}>{country.flag}</Text>
                  <Controller
                    control={control}
                    name="countryCode"
                    render={({ field: { value } }) => (
                      <Text style={styles.countryCode}>{value}</Text>
                    )}
                  />
                  <View style={styles.dropdownArrow}>
                    <DropdownArrow size={12} color="#6b7280" />
                  </View>
                </TouchableOpacity>
                <View style={styles.divider} />

                {/* Phone Icon */}
                <View style={styles.phoneIcon}>
                  <PhoneIcon size={20} color="#6b7280" />
                </View>

                {/* Phone Input */}
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Phone Number"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  )}
                />
              </View>
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <InfoIcon size={20} color="#3b82f6" />
              </View>
              <Text style={styles.infoText}>Standard SMS rates may apply</Text>
            </View>

            {/* Send Code Button */}
            <GluestackButton
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              fullWidth
              className="mb-6"
            >
              Send Code
            </GluestackButton>

            {/* Alternative Link */}
            <TouchableOpacity
              onPress={() => router.push(ROUTES.auth.login)}
              style={styles.alternativeLink}
            >
              <Text style={styles.alternativeLinkText}>Use email instead</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>← Back to sign up options</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.countryPickerBackdrop}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.countryPickerContainer}>
            <Text style={styles.countryPickerTitle}>Select country</Text>
            {COUNTRY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.cca2}
                style={styles.countryOption}
                onPress={() => onSelectCountry(option)}
              >
                <Text style={styles.flagIcon}>{option.flag}</Text>
                <Text style={styles.countryOptionText}>{option.name}</Text>
                <Text style={styles.countryCode}>+{option.callingCode[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: 185.5,
    position: "relative",
  },
  heroGradient: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  circleDecoration: {
    position: "absolute",
    borderRadius: 9999,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -50,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -10,
    left: -30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
    marginTop: 12,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  formSection: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: 20,
  },
  formContentWrapper: {
    paddingHorizontal: 24,
  },
  formDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  formHint: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  phoneInputGroup: {
    marginBottom: 16,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: "#ef4444",
  },
  countryCodeSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
    marginRight: 8,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  dropdownArrow: {
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#d1d5db",
    marginRight: 12,
  },
  phoneIcon: {
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: "#111827",
    padding: 0,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#4b5563",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  sendButton: {
    marginBottom: 24,
  },
  alternativeLink: {
    alignItems: "center",
    marginBottom: 40,
  },
  alternativeLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  countryPickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  countryPickerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  countryPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  countryOptionText: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    marginLeft: 8,
  },
});
