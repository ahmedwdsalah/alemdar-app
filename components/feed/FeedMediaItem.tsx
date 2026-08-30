import { CachedImage } from "@/components/CachedImage";
import type { FeedItem } from "@/lib/mock-feed";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

const DOUBLE_TAP_DELAY = 250;

interface Props {
  item: FeedItem;
  isActive: boolean;
  shouldPreload: boolean;
  width: number;
  height: number;
  onDoubleTapLike?: () => void;
  onLongPress?: () => void;
}

export default function FeedMediaItem({
  item,
  isActive,
  shouldPreload,
  width,
  height,
  onDoubleTapLike,
  onLongPress,
}: Props) {
  const isVideo = item.type === "video";
  const wasActiveRef = useRef(false);

  const shouldLoadSource = isVideo && (isActive || shouldPreload);

  const source: VideoSource | null = useMemo(
  () => (shouldLoadSource ? { uri: item.uri, useCaching: true } : null),
  [shouldLoadSource, item.uri]
);

  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
  });

  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVideo || !player) return;
    const subscription = player.addListener("statusChange", (status) => {
      if (status.status === "error") {
        console.warn("[video error]", item.uri, status.error);
      }
    });
    return () => subscription.remove();
  }, [player, item.uri, isVideo]);

  useEffect(() => {
    if (!isVideo || !player) return;
    const subscription = player.addListener("timeUpdate", (payload: any) => {
      const duration = player.duration || 1;
      const current = payload?.currentTime ?? 0;
      setProgress(Math.min(current / duration, 1));
    });
    return () => subscription.remove();
  }, [player, isVideo]);

  useEffect(() => {
    if (!isVideo) return;
    if (!isActive) {
      setManuallyPaused(false);
    }
  }, [isActive, isVideo]);

  useEffect(() => {
    if (!isVideo || !player) return;

    try {
      if (isActive && !manuallyPaused) {
        player.muted = muted;
        player.play();
      } else if (isActive && manuallyPaused) {
        player.pause();
      } else if (shouldPreload) {
        player.muted = true;
        player.pause();
      } else {
        player.muted = true;
        player.pause();
      }

      if (isActive && !wasActiveRef.current) {
        player.currentTime = 0;
      }
    } catch (error) {
      console.warn("[video player]", item.uri, error);
    }
    wasActiveRef.current = isActive;
  }, [isActive, manuallyPaused, muted, shouldPreload, player, isVideo, item.uri]);

  useEffect(() => {
    Animated.timing(iconOpacity, {
      toValue: manuallyPaused ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [manuallyPaused, iconOpacity]);

  const triggerHeartBurst = () => {
    onDoubleTapLike?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.setValue(0.5);
    heartOpacity.setValue(1);
    Animated.spring(heartScale, {
      toValue: 1.3,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleTap = () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < DOUBLE_TAP_DELAY;
    lastTapRef.current = now;

    if (isDoubleTap) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      triggerHeartBurst();
      return;
    }

    if (isVideo) {
      tapTimeoutRef.current = setTimeout(() => {
        setManuallyPaused((prev) => !prev);
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress?.();
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuted((prev) => {
      const next = !prev;
      if (player) player.muted = next;
      return next;
    });
  };

  return (
    <Pressable
      style={[styles.container, { width, height }]}
      onPress={handleTap}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      {isVideo ? (
        shouldLoadSource ? (
          <VideoView
            player={player}
            style={styles.media}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            allowsVideoFrameAnalysis={false}
          />
        ) : (
          <View style={[styles.media, styles.videoPlaceholder]} />
        )
      ) : (
        <CachedImage
          source={{ uri: item.uri }}
          style={styles.media}
          contentFit="cover"
          recyclingKey={item.id}
        />
      )}

      {isVideo && shouldLoadSource && (
        <>
          <View style={styles.progressTrack} pointerEvents="none">
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          <Pressable onPress={toggleMute} style={styles.muteBtn} hitSlop={10}>
            <Ionicons name={muted ? "volume-mute" : "volume-high"} size={18} color="#fff" />
          </Pressable>

          <Animated.View
            style={[styles.pauseIconWrap, { opacity: iconOpacity }]}
            pointerEvents="none"
          >
            <View style={styles.pauseIconCircle}>
              <Ionicons name="play" size={38} color="#fff" style={styles.playIconOffset} />
            </View>
          </Animated.View>
        </>
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.heartBurstWrap,
          { opacity: heartOpacity, transform: [{ scale: heartScale }] },
        ]}
      >
        <Ionicons name="heart" size={100} color="#e8375a" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#000", overflow: "hidden" },
  media: { flex: 1, width: "100%", height: "100%" },
  videoPlaceholder: { backgroundColor: "#151515" },
  progressTrack: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#FF6B00",
  },
  muteBtn: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIconOffset: { marginLeft: 4 },
  heartBurstWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});