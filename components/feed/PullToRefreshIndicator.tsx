import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export type PullIndicatorVariant = "rotate" | "bounce" | "bar" | "brand";

interface Props {
  variant: PullIndicatorVariant;
  pullProgress: Animated.Value; // 0 → 1 as user pulls down
  isRefreshing: boolean;
}

export default function PullToRefreshIndicator({ variant, pullProgress, isRefreshing }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRefreshing) {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [isRefreshing, spinAnim]);

  const opacity = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (variant === "rotate") {
    const pullRotation = pullProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
      extrapolate: "clamp",
    });
    const spinRotation = spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });
    return (
      <View style={styles.wrap}>
        <Animated.View
          style={{ opacity, transform: [{ rotate: isRefreshing ? spinRotation : pullRotation }] }}
        >
          <Ionicons name="reload" size={26} color="#FF6B00" />
        </Animated.View>
      </View>
    );
  }

  if (variant === "bounce") {
    const scale = pullProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1.2],
      extrapolate: "clamp",
    });
    return (
      <View style={styles.wrap}>
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <Ionicons name="refresh-circle" size={32} color="#FF6B00" />
        </Animated.View>
      </View>
    );
  }

  if (variant === "bar") {
    const barScale = pullProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
    return (
      <View style={styles.wrap}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { transform: [{ scaleX: barScale }] }]} />
        </View>
      </View>
    );
  }

  // "brand"
  const scale = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
    extrapolate: "clamp",
  });
  const pullRotation = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
    extrapolate: "clamp",
  });
  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.brandCircle,
          {
            opacity,
            transform: [
              { scale },
              { rotate: isRefreshing ? spinRotation : pullRotation },
            ],
          },
        ]}
      >
        <Animated.Text style={styles.brandText}>AT</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  barTrack: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  barFill: {
    width: 60,
    height: 3,
    backgroundColor: "#FF6B00",
  },
  brandCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
});