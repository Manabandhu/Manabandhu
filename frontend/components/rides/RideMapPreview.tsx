import React from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Polyline, Circle } from "react-native-svg";

interface MapPoint {
  lat: number;
  lng: number;
  color: string;
}

interface RideMapPreviewProps {
  pickup?: MapPoint;
  drop?: MapPoint;
  driver?: MapPoint;
  height?: number;
}

const padding = 16;

const normalizePoints = (points: MapPoint[], width: number, height: number) => {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  return points.map((point) => {
    const x = padding + ((point.lng - minLng) / lngSpan) * (width - padding * 2);
    const y = padding + ((maxLat - point.lat) / latSpan) * (height - padding * 2);
    return { ...point, x, y };
  });
};

export default function RideMapPreview({ pickup, drop, driver, height = 220 }: RideMapPreviewProps) {
  const points = [pickup, drop, driver].filter(Boolean) as MapPoint[];
  if (points.length < 2) {
    return (
      <View className="bg-gray-100 rounded-2xl items-center justify-center" style={{ height }}>
        <Text className="text-gray-500">Map preview unavailable</Text>
      </View>
    );
  }

  const width = Dimensions.get("window").width - 32;
  const normalized = normalizePoints(points, width, height);
  const pickupPoint = pickup ? normalized.find((point) => point.color === pickup.color) : undefined;
  const dropPoint = drop ? normalized.find((point) => point.color === drop.color) : undefined;
  const driverPoint = driver ? normalized.find((point) => point.color === driver.color) : undefined;

  return (
    <View className="bg-gray-100 rounded-2xl overflow-hidden" style={{ height }}>
      <Svg width={width} height={height}>
        {pickupPoint && dropPoint && (
          <Polyline
            points={`${pickupPoint.x},${pickupPoint.y} ${dropPoint.x},${dropPoint.y}`}
            stroke="#2563EB"
            strokeWidth={3}
          />
        )}
        {pickupPoint && (
          <Circle cx={pickupPoint.x} cy={pickupPoint.y} r={6} fill={pickupPoint.color} />
        )}
        {dropPoint && (
          <Circle cx={dropPoint.x} cy={dropPoint.y} r={6} fill={dropPoint.color} />
        )}
        {driverPoint && (
          <Circle cx={driverPoint.x} cy={driverPoint.y} r={6} fill={driverPoint.color} />
        )}
      </Svg>
    </View>
  );
}
