import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { CheckIcon } from "./Icons";
import { COLORS } from "@/constants";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: React.ReactNode;
  error?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  error = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          error && styles.checkboxError,
        ]}
      >
        {checked && <CheckIcon size={14} color="#ffffff" />}
      </View>
      {label && <View style={styles.label}>{label}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  checkboxError: {
    borderColor: "#ef4444",
  },
  label: {
    flex: 1,
    paddingTop: 2,
  },
});

