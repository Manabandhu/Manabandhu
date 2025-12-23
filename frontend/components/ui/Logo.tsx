import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, G } from "react-native-svg";

interface LogoProps {
  size?: number;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 64, color = "#ffffff" }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer circle */}
        <Circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={color}
          strokeWidth="3"
          opacity="0.3"
        />
        
        {/* Five people in pentagon formation */}
        {/* Person 1 (top) */}
        <G>
          <Circle cx="50" cy="15" r="6" fill={color} />
          <Path
            d="M 50 21 L 50 35"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 50 27 L 42 32"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 50 27 L 58 32"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
        
        {/* Person 2 (top right) */}
        <G>
          <Circle cx="79" cy="33" r="6" fill={color} />
          <Path
            d="M 79 39 L 79 53"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 79 45 L 71 50"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 79 45 L 87 50"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
        
        {/* Person 3 (bottom right) */}
        <G>
          <Circle cx="71" cy="71" r="6" fill={color} />
          <Path
            d="M 71 77 L 71 91"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 71 83 L 63 88"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 71 83 L 79 88"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
        
        {/* Person 4 (bottom left) */}
        <G>
          <Circle cx="29" cy="71" r="6" fill={color} />
          <Path
            d="M 29 77 L 29 91"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 29 83 L 21 88"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 29 83 L 37 88"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
        
        {/* Person 5 (top left) */}
        <G>
          <Circle cx="21" cy="33" r="6" fill={color} />
          <Path
            d="M 21 39 L 21 53"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 21 45 L 13 50"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 21 45 L 29 50"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
        
        {/* Connection lines forming pentagon */}
        <Path
          d="M 50 15 L 79 33 L 71 71 L 29 71 L 21 33 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Center heart */}
        <G>
          <Path
            d="M 50 55 
               C 50 55, 45 48, 40 48 
               C 35 48, 32 51, 32 55 
               C 32 62, 50 70, 50 70 
               C 50 70, 68 62, 68 55 
               C 68 51, 65 48, 60 48 
               C 55 48, 50 55, 50 55 Z"
            fill={color}
            opacity="0.8"
          />
        </G>
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

