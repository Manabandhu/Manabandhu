import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  error?: string;
  reset?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  error,
  reset = false,
  accessibilityLabel,
  testID,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
  }, []);

  useEffect(() => {
    if (reset) {
      setOtp(Array(length).fill(""));
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    }
  }, [reset, length]);

  useEffect(() => {
    const otpString = otp.join("");
    onChange?.(otpString);
    if (otpString.length === length) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete, onChange]);

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    if (!numericText && text.length > 0) return;

    if (numericText.length > 1) {
      // Handle paste
      const digits = numericText.slice(0, length).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    if (numericText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    if (otp[index]) {
      inputRefs.current[index]?.setNativeProps({ selection: { start: 0, end: 1 } });
    }
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View accessibilityLabel={accessibilityLabel || "OTP input"} testID={testID}>
      <View 
        style={styles.container}
        accessibilityLabel={accessibilityLabel || `Enter ${length} digit verification code`}
      >
        {Array.from({ length }).map((_, index) => {
          const isFilled = otp[index].length > 0;
          const isFocused = focusedIndex === index;
          const hasError = !!error;

          return (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.input,
                isFilled && styles.inputFilled,
                isFocused && styles.inputFocused,
                hasError && styles.inputError,
              ]}
              value={otp[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`Digit ${index + 1} of ${length}`}
              
              testID={testID ? `${testID}-${index}` : undefined}
            />
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  input: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  inputFilled: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  inputFocused: {
    borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
  },
});

