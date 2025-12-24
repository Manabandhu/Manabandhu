import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  
  // Pulsing ring animations
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.2)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.1)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const spinnerRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start pulsing animations immediately
    const ring1Animation = Animated.loop(
      Animated.parallel([
        Animated.timing(ring1Scale, {
          toValue: 2.5,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ring1Opacity, {
            toValue: 0.2,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ring1Opacity, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const ring2Animation = Animated.loop(
      Animated.parallel([
        Animated.timing(ring2Scale, {
          toValue: 2.5,
          duration: 2500,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ring2Opacity, {
            toValue: 0.1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const logoPulseAnimation = Animated.loop(
    Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const spinnerAnimation = Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    ring1Animation.start();
    ring2Animation.start();
    logoPulseAnimation.start();
    spinnerAnimation.start();

    // Main entrance animations
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(loadingOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Call completion callback
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3000);

    return () => {
      clearTimeout(timer);
      ring1Animation.stop();
      ring2Animation.stop();
      logoPulseAnimation.stop();
      spinnerAnimation.stop();
    };
  }, []);

  const spin = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Main Gradient Background */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient Background Glows */}
      <View style={[styles.glow1, styles.glow]} />
      <View style={[styles.glow2, styles.glow]} />

      {/* Central Content */}
      <View style={styles.centralContent}>
        {/* Logo Animation Wrapper */}
        <View style={styles.logoWrapper}>
          {/* Pulsing Rings */}
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                transform: [{ scale: ring1Scale }],
                opacity: ring1Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                transform: [{ scale: ring2Scale }],
                opacity: ring2Opacity,
              },
            ]}
          />

          {/* Logo Container */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { scale: logoPulse }],
              },
            ]}
          >
            <View style={styles.logoInner}>
              {/* ManaBandhu Logo SVG */}
              <Svg width={96} height={96} viewBox="0 0 24 24" style={styles.logoSvg}>
                {/* Community/People Icon */}
                <Path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d="M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d="M23 21v-2a4 4 0 0 0-3-3.87"
                  stroke="#FDE047"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 3.13a4 4 0 0 1 0 7.75"
                  stroke="#FDE047"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Heart/Connection Symbol */}
                <Path
                  d="M12 15c-1.5-1.5-4-1.5-4 1s2.5 2.5 4 1 4 1.5 4-1-2.5-2.5-4-1z"
                  fill="#F87171"
                  stroke="#F87171"
                  strokeWidth="1"
                />
              </Svg>
            </View>
          </Animated.View>
        </View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>
            Mana<Text style={styles.appNameAccent}>Bandhu</Text>
          </Text>
          <Text style={styles.tagline}>CONNECT • SUPPORT • THRIVE</Text>
        </Animated.View>
      </View>

      {/* Bottom Loading Section */}
      <Animated.View
        style={[
          styles.loadingSection,
          {
            opacity: loadingOpacity,
          },
        ]}
      >
        {/* Custom Spinner */}
        <View style={styles.spinnerContainer}>
          <View style={styles.spinnerOuter} />
          <Animated.View
            style={[
              styles.spinnerInner,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>Building your community...</Text>
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
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    borderRadius: 9999,
  },
  glow1: {
    width: 256,
    height: 256,
    top: -128,
    left: -128,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    // Note: blur effect in React Native requires BlurView or a library
    // For now, we'll use opacity to simulate the effect
  },
  glow2: {
    width: 320,
    height: 320,
    bottom: -106,
    right: 106,
    backgroundColor: "rgba(196, 181, 253, 0.2)", // purple-300 with opacity
  },
  centralContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 32,
    zIndex: 10,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pulsingRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoSvg: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appNameAccent: {
    color: "#FDE047", // yellow-300
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(199, 210, 254, 1)", // indigo-100
    letterSpacing: 3.2, // 0.2em
    textTransform: "uppercase",
    opacity: 0.9,
  },
  loadingSection: {
    position: "absolute",
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  spinnerContainer: {
    width: 48,
    height: 48,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerOuter: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  spinnerInner: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: "#FDE047", // yellow-300
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
});
