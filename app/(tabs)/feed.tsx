import CustomShareMenu from "@/components/CustomShareMenu";
import FeedActionRail from "@/components/feed/FeedActionRail";
import FeedMediaItem from "@/components/feed/FeedMediaItem";
import PullToRefreshIndicator, {
  type PullIndicatorVariant,
} from "@/components/feed/PullToRefreshIndicator";
import { FEED_ITEMS, type FeedItem } from "@/lib/mock-feed";
import { useIsFocused } from "@react-navigation/native";
import { FlashList, type FlashListRef, type ViewToken } from "@shopify/flash-list";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 75;
const PAGE_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;
const TRIGGER_DISTANCE = 80;

const PRELOAD_AHEAD = 1;
const PRELOAD_BEHIND = 1;

const PULL_INDICATOR_VARIANT: PullIndicatorVariant = "brand";

function shuffleAvoidingRepeat<T extends { id: string }>(
  arr: T[],
  previousFirstId: string | null
): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (previousFirstId && copy[0]?.id === previousFirstId && copy.length > 1) {
    const swapIndex = 1 + Math.floor(Math.random() * (copy.length - 1));
    [copy[0], copy[swapIndex]] = [copy[swapIndex], copy[0]];
  }
  return copy;
}

export default function FeedScreen() {
  const [items, setItems] = useState<FeedItem[]>(FEED_ITEMS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [shareItem, setShareItem] = useState<FeedItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isFocused = useIsFocused();
  const listRef = useRef<FlashListRef<FeedItem>>(null);
  const lastOffsetRef = useRef(0);
  const pullProgress = useRef(new Animated.Value(0)).current;
  const currentPullDistanceRef = useRef(0);

  const runRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setItems((prev) => shuffleAvoidingRepeat(FEED_ITEMS, prev[0]?.id ?? null));
      setActiveIndex(0);
      setRefreshKey((k) => k + 1);
      setIsRefreshing(false);
      Animated.timing(pullProgress, { toValue: 0, duration: 200, useNativeDriver: true }).start();

      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: 0, animated: false });
      });
    }, 900);
  }, [pullProgress]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;

      if (y > lastOffsetRef.current) setScrollDirection("down");
      else if (y < lastOffsetRef.current) setScrollDirection("up");
      lastOffsetRef.current = y;

      const pullDistance = y < 0 ? Math.min(-y, TRIGGER_DISTANCE * 1.5) : 0;
      currentPullDistanceRef.current = pullDistance;
      if (!isRefreshing) {
        pullProgress.setValue(Math.min(pullDistance / TRIGGER_DISTANCE, 1));
      }
    },
    [pullProgress, isRefreshing]
  );

  const onReleaseCheck = useCallback(() => {
    if (!isRefreshing && currentPullDistanceRef.current >= TRIGGER_DISTANCE) {
      runRefresh();
    } else if (!isRefreshing) {
      Animated.timing(pullProgress, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isRefreshing, runRefresh, pullProgress]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const handleDoubleTapLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleLikeToggle = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      const distance = index - activeIndex;
      const isAhead = scrollDirection === "down" ? distance > 0 : distance < 0;
      const shouldPreloadAhead = isAhead && Math.abs(distance) <= PRELOAD_AHEAD;
      const shouldPreloadBehind = !isAhead && Math.abs(distance) <= PRELOAD_BEHIND;
      const shouldPreload = shouldPreloadAhead || shouldPreloadBehind;

      return (
        <View style={[styles.page, { height: PAGE_HEIGHT }]}>
          <FeedMediaItem
            item={item}
            isActive={index === activeIndex && isFocused}
            shouldPreload={shouldPreload}
            width={SCREEN_WIDTH}
            height={PAGE_HEIGHT}
            onDoubleTapLike={() => handleDoubleTapLike(item.id)}
            onLongPress={() => setShareItem(item)}
          />
          <View style={styles.captionWrap} pointerEvents="none">
            <Text style={styles.author}>{item.author}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
          </View>
          <FeedActionRail
            liked={likedIds.has(item.id)}
            onLikePress={() => handleLikeToggle(item.id)}
            onSharePress={() => setShareItem(item)}
          />
        </View>
      );
    },
    [activeIndex, likedIds, handleDoubleTapLike, handleLikeToggle, isFocused, scrollDirection]
  );

  return (
    <View style={[styles.container, { paddingBottom: TAB_BAR_HEIGHT }]}>
      <StatusBar style="light" />

      <View style={styles.pullIndicatorWrap} pointerEvents="none">
        <PullToRefreshIndicator
          variant={PULL_INDICATOR_VARIANT}
          pullProgress={pullProgress}
          isRefreshing={isRefreshing}
        />
      </View>

      <FlashList
        ref={listRef}
        data={items}
        keyExtractor={(item) => `${item.id}-${refreshKey}`}
        renderItem={renderItem}
        getItemType={() => "feedItem"}
        pagingEnabled
        directionalLockEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={PAGE_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={onReleaseCheck}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <CustomShareMenu
        visible={!!shareItem}
        onClose={() => setShareItem(null)}
        title={shareItem?.caption ?? ""}
        message={`Check out this on Alemdar Teknik!`}
        url={shareItem?.uri ?? "https://alemdarteknik.com"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  pullIndicatorWrap: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  page: { width: SCREEN_WIDTH },
  captionWrap: { position: "absolute", bottom: 15, left: 20, right: 80 },
  author: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  caption: { color: "#fff", fontSize: 14, lineHeight: 19 },
});