import { SHOWCASE_MODELS, type ModelCategory } from "@/lib/mock-models";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Chip, RadioButton } from "react-native-paper";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

const HEADER_HEIGHT = 64;
const SEARCH_ROW_HEIGHT = 48;

const CATEGORY_FILTERS: { key: ModelCategory; label: string }[] = [
  { key: "enclosure", label: "Enclosures" },
  { key: "robotics", label: "Robotics" },
  { key: "accessory", label: "Accessories" },
];

const sortOptions = [
  { key: "default", label: "Featured" },
  { key: "price-low", label: "Price: Low → High" },
  { key: "price-high", label: "Price: High → Low" },
];

export default function ModelsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["55%"], []);

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ModelCategory[]>([]);
  const [selectedSort, setSelectedSort] = useState("default");

  const [debouncedQuery] = useDebounce(query, 200);
  const isSearching = query.trim().length > 0;
  const isDebouncing = isSearching && query.trim() !== debouncedQuery.trim();

  const t: Record<string, string> = {
    bg: isDark ? "#0A0A0A" : "#ffffff",
    border: isDark ? "#2A2A2A" : "#E8E8E8",
    text: isDark ? "#FFFFFF" : "#111111",
    subtext: "#888888",
    inputBg: isDark ? "#1A1A1A" : "#FFFFFF",
    chipBg: isDark ? "#252525" : "#EFEFEF",
    chipText: isDark ? "#CCCCCC" : "#444444",
    accent: "#FF6B00",
    sheet: isDark ? "#161616" : "#FFFFFF",
    sheetBg: isDark ? "#1E1E1E" : "#F5F5F5",
    cardBorder: isDark ? "#232323" : "#EAEAEA",
  };

  const toggleCategory = (cat: ModelCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredModels = useMemo(() => {
    let list = [...SHOWCASE_MODELS];

    if (debouncedQuery.trim().length > 0) {
      const q = debouncedQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter((item) => selectedCategories.includes(item.category));
    }

    if (selectedSort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [debouncedQuery, selectedCategories, selectedSort]);

  const openModel = (item: (typeof SHOWCASE_MODELS)[number]) => {
    router.push({ pathname: "/model-detail", params: { id: item.id } });
  };

  const openSearch = () => {
    setShowSearch(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setQuery("");
    setShowSearch(false);
  };

  const openFilter = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.present();
  };
  const closeFilter = () => bottomSheetRef.current?.dismiss();
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedSort("default");
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const headerTotalHeight =
    insets.top + HEADER_HEIGHT + (showSearch ? 12 + SEARCH_ROW_HEIGHT + 12 : 12);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <FlatList
        key={isSearching ? "list" : "grid"}
        data={filteredModels}
        keyExtractor={(item) => item.id}
        numColumns={isSearching ? 1 : 2}
        columnWrapperStyle={isSearching ? undefined : { gap: 12 }}
        contentContainerStyle={{
          paddingHorizontal: isSearching ? 0 : 20,
          paddingTop: headerTotalHeight + 16,
          paddingBottom: insets.bottom + 120,
          gap: isSearching ? 0 : 12,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ItemSeparatorComponent={
          isSearching
            ? () => <View style={{ height: 1, backgroundColor: t.border, marginLeft: 86 }} />
            : undefined
        }
        ListHeaderComponent={
          <Animated.View
            key={isSearching ? "results-header" : "idle-header"}
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
          >
            {!isSearching ? null : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingTop: 4,
                  paddingBottom: 8,
                }}
              >
                <Text style={{ color: t.text, fontSize: 15, fontWeight: "600" }}>Results</Text>
                <Text style={{ color: t.subtext, fontSize: 13 }}>
                  {isDebouncing ? "…" : `${filteredModels.length} results`}
                </Text>
              </View>
            )}
          </Animated.View>
        }
        ListEmptyComponent={() =>
          isSearching && isDebouncing ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={t.accent} />
              <Text style={{ color: t.subtext, fontSize: 13 }}>Searching...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={{ color: t.subtext, fontSize: 15 }}>
                {isSearching ? `No results for "${debouncedQuery}"` : "No models in this category yet."}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (!isSearching) {
            return (
              <Pressable
                style={[styles.card, { backgroundColor: t.sheetBg }]}
                onPress={() => openModel(item)}
              >
                <View style={styles.cardImageWrap}>
                  <Image source={{ uri: item.thumbnail }} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardPriceTag}>
                    <Text style={styles.cardPriceText}>${item.price.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.cardMetaRow}>
                    <Ionicons name="cube-outline" size={11} color={t.subtext} />
                    <Text style={[styles.cardMeta, { color: t.subtext }]} numberOfLines={1}>{item.material}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }

          return (
            <TouchableOpacity
              onPress={() => openModel(item)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: t.bg,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: t.sheetBg,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={{ fontSize: 15, fontWeight: "500", color: t.text }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: t.subtext, marginTop: 2 }}>
                  {item.material}
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: t.text }}>
                ${item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={[styles.headerWrap, { height: headerTotalHeight, paddingTop: insets.top }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: t.text }]}>3D Models</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={showSearch ? closeSearch : openSearch}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name={showSearch ? "close" : "search"} size={20} color={t.text} />
            </TouchableOpacity>

            <Pressable style={styles.uploadPill} onPress={() => router.push("/model-upload")}>
              <Ionicons name="cloud-upload-outline" size={15} color="#fff" />
              <Text style={styles.uploadPillText}>Upload</Text>
            </Pressable>
          </View>
        </View>

        {showSearch && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[styles.searchRow, { marginTop: 12 }]}
          >
            <Animated.View
              layout={LinearTransition.duration(250)}
              style={[styles.searchBar, { backgroundColor: t.inputBg, borderColor: t.border, height: SEARCH_ROW_HEIGHT }]}
            >
              <Ionicons name="search" size={18} color={t.subtext} style={{ marginRight: 10 }} />
              <TextInput
                ref={inputRef}
                style={{ flex: 1, fontSize: 15, color: t.text }}
                placeholder="Search models..."
                placeholderTextColor={t.subtext}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={openFilter} style={{ marginLeft: 8 }}>
                <Ionicons name="options-outline" size={20} color={t.accent} />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={closeSearch}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={{ color: t.accent, fontSize: 15, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </BlurView>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: t.sheet }}
        handleIndicatorStyle={{ backgroundColor: t.border, width: 40 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 24, textAlign: "center" }}>
            Filters
          </Text>

          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ionicons name="grid-outline" size={16} color={t.accent} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: t.text }}>Category</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {CATEGORY_FILTERS.map(({ key, label }) => {
                const active = selectedCategories.includes(key);
                return (
                  <Chip
                    key={key}
                    selected={active}
                    onPress={() => toggleCategory(key)}
                    mode={active ? "flat" : "outlined"}
                    showSelectedCheck
                    style={{ backgroundColor: active ? t.accent : t.sheetBg, borderColor: active ? t.accent : t.border }}
                    textStyle={{ color: active ? "#fff" : t.chipText, fontSize: 13, fontWeight: "500" }}
                  >
                    {label}
                  </Chip>
                );
              })}
            </View>
          </View>

          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ionicons name="swap-vertical-outline" size={16} color={t.accent} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: t.text }}>Sort By</Text>
            </View>
            <RadioButton.Group onValueChange={(val) => setSelectedSort(val)} value={selectedSort}>
              {sortOptions.map(({ key, label }) => (
                <RadioButton.Item
                  key={key}
                  label={label}
                  value={key}
                  color={t.accent}
                  labelStyle={{
                    color: selectedSort === key ? t.accent : t.text,
                    fontSize: 14,
                    fontWeight: selectedSort === key ? "600" : "400",
                    textAlign: "left",
                  }}
                  style={{ paddingHorizontal: 0, paddingVertical: 4 }}
                  position="trailing"
                />
              ))}
            </RadioButton.Group>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={resetFilters} style={[styles.resetBtn, { borderColor: t.border }]}>
              <Ionicons name="refresh-outline" size={16} color={t.text} />
              <Text style={{ color: t.text, fontWeight: "600" }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeFilter} style={[styles.applyBtn, { backgroundColor: t.accent }]}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Apply Filters</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: HEADER_HEIGHT,
  },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF6B00",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadPillText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  emptyState: { alignItems: "center", marginTop: 80, gap: 12, paddingHorizontal: 20 },

  card: { flex: 1, borderRadius: 20, overflow: "hidden" },
  cardImageWrap: { padding: 8 },
  cardImage: { width: "100%", aspectRatio: 1, borderRadius: 14, backgroundColor: "#00000006" },
  cardPriceTag: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardPriceText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  cardBody: { paddingHorizontal: 12, paddingBottom: 12, gap: 4 },
  cardName: { fontSize: 14, fontWeight: "700" },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMeta: { fontSize: 11 },

  resetBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  applyBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
});