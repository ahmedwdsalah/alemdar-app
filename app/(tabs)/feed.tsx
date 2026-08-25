import FeedMediaItem from "@/components/feed/FeedMediaItem";
import { FEED_ITEMS } from "@/lib/mock-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();
  const PAGE_HEIGHT = SCREEN_HEIGHT - tabBarHeight;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof FEED_ITEMS)[number]; index: number }) => (
      <View style={[styles.page, { height: PAGE_HEIGHT }]}>
        <FeedMediaItem item={item} isActive={index === activeIndex} />
        <View style={styles.captionWrap}>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>
      </View>
    ),
    [activeIndex, PAGE_HEIGHT]
  );

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <StatusBar style="light" />
      <FlatList
        data={FEED_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={PAGE_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: PAGE_HEIGHT,
          offset: PAGE_HEIGHT * index,
          index,
        })}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  page: {
    width: SCREEN_WIDTH,
  },
  captionWrap: { position: "absolute", bottom: 15, left: 20, right: 80 },
  author: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  caption: { color: "#fff", fontSize: 14, lineHeight: 19 },
});