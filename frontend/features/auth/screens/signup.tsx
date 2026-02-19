import React, { useState, useRef, useMemo } from "react";
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
  Linking,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { countries } from '@/shared/constants/countries';
import { Logo } from '@/shared/components/ui/Logo";
import { UserIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from '@/shared/components/ui/Icons";
import { GluestackCheckbox } from '@/shared/components/ui/gluestack-index";
import { GluestackButton } from '@/shared/components/ui/gluestack-index";
import { authApi } from "@/lib/api";
import { GRADIENTS } from '@/shared/constants";
import { ROUTES } from '@/shared/constants/routes";
import * as Haptics from "expo-haptics";
import { normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizeEmail, sanitizeText, sanitizePhone } from "@/lib/sanitize";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

const { width } = Dimensions.get("window");

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    countryCode: z.string().default("+1"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('US');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      countryCode: "+1",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    mode: "onChange",
  });

  const onSelectCountry = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setCountryCode(country.code);
    setValue('countryCode', country.dialCode);
    bottomSheetRef.current?.close();
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedName = sanitizeText(data.fullName, 100);
      const sanitizedPhone = sanitizePhone(data.phoneNumber);
      
      const response = await authApi.signup({
        name: sanitizedName,
        email: sanitizedEmail,
        password: data.password,
      });

      if (response.idToken) {
        await signInWithCustomToken(auth, response.idToken);
        router.push(ROUTES.auth.profile);
      }
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const appError = normalizeError(error);
      setError(appError.message || 'Signup failed. Please try again.');
      logger.error("Signup error", { email: data.email }, error);
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

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <Logo size={60} />
              <Text style={styles.heroTitle}>Create Account</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formDescription}>Enter your details to get started</Text>

          <View style={styles.formContainer}>
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.fullName && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <UserIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                    />
                  )}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <EmailIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.phoneNumber && styles.inputWrapperError,
                ]}
              >
                <TouchableOpacity 
                  style={styles.countryCodeWrapper}
                  onPress={() => bottomSheetRef.current?.expand()}
                >
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Controller
                    control={control}
                    name="countryCode"
                    render={({ field: { value } }) => (
                      <Text style={styles.countryCode}>{value}</Text>
                    )}
                  />
                </TouchableOpacity>
                <View style={styles.divider} />
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.phoneInput]}
                      placeholder="Phone Number"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              </View>
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} color="#6b7280" />
                  ) : (
                    <EyeIcon size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword && styles.inputWrapperError,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleButton}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon size={20} color="#6b7280" />
                  ) : (
                    <EyeIcon size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <Controller
                control={control}
                name="termsAccepted"
                render={({ field: { onChange, value } }) => (
                  <GluestackCheckbox
                    isChecked={value}
                    onChange={(checked) => onChange(checked)}
                    isInvalid={!!errors.termsAccepted}
                    label={
                      <Text style={styles.termsText}>
                        I agree to the{" "}
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
                    }
                  />
                )}
              />
            </View>

            {/* Submit Button */}
            <GluestackButton
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              isDisabled={!isValid || loading}
              fullWidth
              className="mb-6"
            >
              Create Account
            </GluestackButton>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backLink}>Back to sign up options</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Select Country</Text>
          <FlatList
            data={countries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => onSelectCountry(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDialCode}>{item.dialCode}</Text>
              </TouchableOpacity>
            )}
          />
        </BottomSheetView>
      </BottomSheet>
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
    height: 180,
    position: "relative",
  },
  heroGradient: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  circleDecoration: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  formDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#111827",
    padding: 0,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  countryCodeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginRight: 12,
  },
  phoneInput: {
    marginLeft: 0,
  },
  toggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#374151",
    lineHeight: 20,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  termsLink: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  submitButton: {
    marginBottom: 24,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  countryDialCode: {
    fontSize: 16,
    color: '#666',
  },
});

