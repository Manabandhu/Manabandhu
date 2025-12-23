import React, { useEffect, useRef } from "react";
import { Pressable, View, Animated } from "react-native";

export interface GluestackSwitchProps {
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  isDisabled?: boolean;
  className?: string;
}

export const GluestackSwitch: React.FC<GluestackSwitchProps> = ({
  isChecked,
  onToggle,
  isDisabled = false,
  className = "",
}) => {
  const translateX = useRef(new Animated.Value(isChecked ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isChecked ? 20 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isChecked, translateX]);

  const handlePress = () => {
    if (!isDisabled) {
      onToggle(!isChecked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={className}
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      <View
        className={`w-11 h-6 rounded-full ${
          isChecked ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <Animated.View
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          style={{
            transform: [{ translateX }],
            margin: 2,
          }}
        />
      </View>
    </Pressable>
  );
};

