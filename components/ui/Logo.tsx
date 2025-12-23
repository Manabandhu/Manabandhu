import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface LogoProps {
  size?: number;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 70, color = "#ffffff" }) => {
  const scale = size / 100;
  const center = 50;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer circle */}
        <Circle
          cx={center}
          cy={center}
          r={48}
          stroke={color}
          strokeWidth={3}
          fill="none"
        />
        
        {/* Decorative circles */}
        <Circle cx={center} cy={center - 28} r={6} fill={color} />
        <Circle cx={center + 22} cy={center - 16} r={6} fill={color} />
        <Circle cx={center + 22} cy={center + 16} r={6} fill={color} />
        <Circle cx={center - 22} cy={center + 16} r={6} fill={color} />
        <Circle cx={center - 22} cy={center - 16} r={6} fill={color} />
        
        {/* Decorative paths */}
        <Path
          d="M 50 22 Q 42 16 38 22 Q 38 28 50 36 Q 62 28 62 22 Q 58 16 50 22 Z"
          fill={color}
          opacity={0.8}
        />
        <Path
          d="M 50 22 L 72 34 L 72 66 L 28 66 L 28 34 Z"
          stroke={color}
          strokeWidth={2}
          fill="none"
          opacity={0.6}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

