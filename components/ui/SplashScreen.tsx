import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { COLORS } from "@/constants";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo in
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Call completion callback after animations
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#6366f1", "#4f46e5", "#4338ca"]}
      start={{ x: 0.09, y: 0.21 }}
      end={{ x: 0.91, y: 0.79 }}
      style={styles.container}
    >
      {/* Circle Decorations */}
      <View style={[styles.circleDecoration, styles.circle1]} />
      <View style={[styles.circleDecoration, styles.circle2]} />
      <View style={[styles.circleDecoration, styles.circle3]} />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Animated.View style={{ opacity: logoOpacity }}>
          <SplashLogo />
        </Animated.View>
        
        <Animated.Text style={[styles.wordmark, { opacity: wordmarkOpacity }]}>
          ManaBandhu
        </Animated.Text>
        
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Your trusted health companion
        </Animated.Text>
      </View>

      {/* Loading Section */}
      <Animated.View style={[styles.loadingSection, { opacity: loadingOpacity }]}>
        <LoadingSpinner />
      </Animated.View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>
          Version {Constants.expoConfig?.version || "1.0.0"}
        </Text>
      </View>
    </LinearGradient>
  );
}

function SplashLogo() {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoCircle}>
        {/* Main circle */}
        <View style={styles.logoMainCircle} />
        {/* Decorative circles and paths */}
        <View style={styles.logoDecoration}>
          <View style={[styles.logoDot, { top: 20, left: 20 }]} />
          <View style={[styles.logoDot, { top: 20, right: 20 }]} />
          <View style={[styles.logoDot, { bottom: 20, left: 20 }]} />
          <View style={[styles.logoDot, { bottom: 20, right: 20 }]} />
          <View style={[styles.logoDot, { top: 45, left: 45 }]} />
          <View style={[styles.logoDot, { top: 45, right: 45 }]} />
        </View>
      </View>
    </View>
  );
}

function LoadingSpinner() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.spinnerContainer}>
      <Animated.View style={[styles.spinner, { opacity: pulseAnim }]}>
        {/* Top line - active */}
        <View style={[styles.spinnerLine, styles.spinnerLineTop]} />
        {/* Bottom line - dimmed */}
        <View style={[styles.spinnerLine, styles.spinnerLineBottom]} />
        {/* Left line - dimmed */}
        <View style={[styles.spinnerLine, styles.spinnerLineLeft]} />
        {/* Right line - dimmed */}
        <View style={[styles.spinnerLine, styles.spinnerLineRight]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  circleDecoration: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 9999,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -120,
    right: -40,
  },
  circle2: {
    width: 350,
    height: 350,
    bottom: -50,
    left: -100,
  },
  circle3: {
    width: 300,
    height: 300,
    top: "40%",
    right: -40,
    opacity: 0.05,
  },
  logoSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    zIndex: 10,
  },
  logoContainer: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logoMainCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  logoDecoration: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  logoDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  wordmark: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
    letterSpacing: 0.5,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    letterSpacing: 0.2,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  loadingSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    zIndex: 10,
  },
  spinnerContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    position: "relative",
  },
  spinnerLine: {
    position: "absolute",
    backgroundColor: "#ffffff",
  },
  spinnerLineTop: {
    width: 32,
    height: 3,
    top: 0,
    left: 0,
    borderRadius: 2,
  },
  spinnerLineBottom: {
    width: 32,
    height: 3,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
  },
  spinnerLineLeft: {
    width: 3,
    height: 32,
    left: 0,
    top: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
  },
  spinnerLineRight: {
    width: 3,
    height: 32,
    right: 0,
    top: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
  },
  versionInfo: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  versionText: {
    fontSize: 10,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 0.1,
    fontFamily: "Inter, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
});

