import React from "react";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

interface AmenityIconProps {
  name: string;
  size?: number;
  color?: string;
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({ name, size = 24, color = "#6B7280" }) => {
  const iconMap: Record<string, React.ReactElement> = {
    parking: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={2} />
        <Path d="M7 7h10v10H7z" stroke={color} strokeWidth={2} />
        <Circle cx="9" cy="9" r="1" fill={color} />
        <Circle cx="15" cy="15" r="1" fill={color} />
      </Svg>
    ),
    security: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={2} />
        <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    wifi: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={color} strokeWidth={2} />
        <Path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={color} strokeWidth={2} />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={color} strokeWidth={2} />
        <Line x1="12" y1="20" x2="12.01" y2="20" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    ac: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={2} />
        <Circle cx="6" cy="12" r="2" stroke={color} strokeWidth={2} />
        <Circle cx="18" cy="12" r="2" stroke={color} strokeWidth={2} />
        <Line x1="10" y1="12" x2="14" y2="12" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    gym: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6.5 6.5L17.5 17.5" stroke={color} strokeWidth={2} />
        <Path d="M6.5 17.5L17.5 6.5" stroke={color} strokeWidth={2} />
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    pool: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M2 10h20v8H2z" stroke={color} strokeWidth={2} />
        <Path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke={color} strokeWidth={2} />
        <Circle cx="8" cy="14" r="1" fill={color} />
        <Circle cx="16" cy="14" r="1" fill={color} />
      </Svg>
    ),
    laundry: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
        <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={2} />
        <Circle cx="12" cy="12" r="2" fill={color} />
      </Svg>
    ),
    elevator: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth={2} />
        <Line x1="8" y1="6" x2="16" y2="6" stroke={color} strokeWidth={2} />
        <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={2} />
        <Line x1="8" y1="18" x2="16" y2="18" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    balcony: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 21h18" stroke={color} strokeWidth={2} />
        <Path d="M5 21V7l7-4 7 4v14" stroke={color} strokeWidth={2} />
        <Path d="M5 7h14" stroke={color} strokeWidth={2} />
        <Line x1="9" y1="11" x2="9" y2="21" stroke={color} strokeWidth={2} />
        <Line x1="15" y1="11" x2="15" y2="21" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    furnished: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth={2} />
        <Path d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1v3" stroke={color} strokeWidth={2} />
        <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={2} />
      </Svg>
    ),
  };

  return iconMap[name.toLowerCase()] || (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth={2} />
      <Line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth={2} />
    </Svg>
  );
};

export const UtilityIcon: React.FC<AmenityIconProps> = ({ name, size = 24, color = "#6B7280" }) => {
  const iconMap: Record<string, React.ReactElement> = {
    electricity: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    water: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke={color} strokeWidth={2} />
        <Path d="M12 2v20" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    gas: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
        <Path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    internet: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
        <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth={2} />
      </Svg>
    ),
    maintenance: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke={color} strokeWidth={2} />
      </Svg>
    ),
  };

  return iconMap[name.toLowerCase()] || (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth={2} />
      <Line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth={2} />
    </Svg>
  );
};

