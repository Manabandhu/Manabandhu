import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export interface BiometricType {
  available: boolean;
  type: "face" | "fingerprint" | "iris" | "none";
  name: string;
}

/**
 * Check if biometric authentication is available on the device
 */
export const checkBiometricAvailability = async (): Promise<BiometricType> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return {
        available: false,
        type: "none",
        name: "Not Available",
      };
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return {
        available: false,
        type: "none",
        name: "Not Enrolled",
      };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // Determine the biometric type
    let biometricType: "face" | "fingerprint" | "iris" = "fingerprint";
    let name = "Biometric";

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = "face";
      name = Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = "fingerprint";
      name = "Fingerprint";
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = "iris";
      name = "Iris";
    }

    return {
      available: true,
      type: biometricType,
      name,
    };
  } catch (error) {
    console.error("Error checking biometric availability:", error);
    return {
      available: false,
      type: "none",
      name: "Error",
    };
  }
};

/**
 * Authenticate using biometric (Face ID, Fingerprint, etc.)
 */
export const authenticateWithBiometric = async (
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const biometric = await checkBiometricAvailability();
    
    if (!biometric.available) {
      return {
        success: false,
        error: `${biometric.name} is not available on this device`,
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason || `Authenticate with ${biometric.name}`,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
      fallbackLabel: "Use Password",
    });

    if (result.success) {
      return { success: true };
    } else {
      if (result.error === "user_cancel") {
        return {
          success: false,
          error: "Authentication cancelled",
        };
      } else if (result.error === "user_fallback") {
        return {
          success: false,
          error: "user_fallback",
        };
      } else {
        return {
          success: false,
          error: result.error || "Authentication failed",
        };
      }
    }
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Get a user-friendly name for the biometric type
 */
export const getBiometricName = (type: BiometricType): string => {
  if (!type.available) {
    return "Biometric";
  }
  return type.name;
};

