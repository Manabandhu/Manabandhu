import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { GoogleIcon, FacebookIcon, AppleIcon, PhoneIcon } from "@/components/ui/Icons";

const { width } = Dimensions.get("window");
const buttonWidth = (width - 60) / 2; // 2 columns with 20px padding on each side and 20px gap

interface SocialLoginButtonsProps {
  onGooglePress: () => Promise<void>;
  onApplePress: () => Promise<void>;
  onFacebookPress?: () => Promise<void>;
  onPhonePress?: () => Promise<void>;
  loading?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGooglePress,
  onApplePress,
  onFacebookPress,
  onPhonePress,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Google Button - Top Left */}
      <TouchableOpacity
        onPress={onGooglePress}
        disabled={loading}
        activeOpacity={0.8}
        style={[styles.socialButton, styles.googleButton]}
      >
        <GoogleIcon size={24} />
      </TouchableOpacity>

      {/* Facebook Button - Top Right (only show if handler provided) */}
      {onFacebookPress ? (
        <TouchableOpacity
          onPress={onFacebookPress}
          disabled={loading}
          activeOpacity={0.8}
          style={[styles.socialButton, styles.facebookButton]}
        >
          <FacebookIcon size={24} color="#ffffff" />
        </TouchableOpacity>
      ) : null}

      {/* Apple Button - Bottom Left */}
      <TouchableOpacity
        onPress={onApplePress}
        disabled={loading}
        activeOpacity={0.8}
        style={[styles.socialButton, styles.appleButton]}
      >
        <AppleIcon size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Phone Button - Bottom Right */}
      <TouchableOpacity
        onPress={onPhonePress}
        disabled={loading}
        activeOpacity={0.8}
        style={[styles.socialButton, styles.phoneButton]}
      >
        <PhoneIcon size={24} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  socialButton: {
    width: buttonWidth,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  googleButton: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  facebookButton: {
    backgroundColor: "#1877f2",
    borderColor: "#1877f2",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  phoneButton: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
});
