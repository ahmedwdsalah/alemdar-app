import { CachedImage } from "@/components/CachedImage";
import { ProductCard } from "@/components/ProductCard";
import { useOfflineBannerVisible } from "@/hooks/useOfflineBanner";
import { usePrefetchImages } from "@/hooks/usePrefetchImages";
import { useSectionProducts } from "@/hooks/useSectionProducts";
import { categoryIcons } from '@/lib/category-icons';
import { useLocale } from "@/lib/i18n";
import { getSectionMeta } from "@/lib/section-meta";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { Chip, RadioButton } from "react-native-paper";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 20;
const HEADER_ROW_HEIGHT = 56;
const SEARCH_ROW_HEIGHT = 48;

const sortOptions = [
  { key: "default", label: "Featured" },
  { key: "price-low", label: "Price: Low → High" },
  { key: "price-high", label: "Price: High → Low" },
];

export default function CategoryDetail() {
  useLocale();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const params = useLocalSearchParams();
  const offlineBannerVisible = useOfflineBannerVisible();
  const insets = useSafeAreaInsets();

  const inputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["55%"], []);

  // ⭐ Search bar is hidden until the header icon is tapped
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 200);
  const isSearching = query.trim().length > 0;
  const isDebouncing = isSearching && query.trim() !== debouncedQuery.trim();

  const [selectedSort, setSelectedSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const section = (params.section as string) ?? "main";
  const meta = getSectionMeta(section);
  const categoryIcon = categoryIcons[section as keyof typeof categoryIcons];

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useSectionProducts(section, { limit: PAGE_SIZE });

  const products = data?.pages.flatMap((p) => p.data) ?? [];

  usePrefetchImages(products.map((p) => p.image_filename));

  const bg = isDark ? "#000" : '#ffffff';
  const textColor = isDark ? "#fff" : "#000";
  const subText = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const inputBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const inputBorder = isDark ? "#2A2A2A" : "#E8E8E8";
  const sheetBg = isDark ? "#161616" : "#FFFFFF";
  const sheetInnerBg = isDark ? "#1E1E1E" : "#F5F5F5";

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
    setSelectedSort("default");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  // ⭐ Filtered products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (debouncedQuery.trim().length > 0) {
      const q = debouncedQuery.trim().toLowerCase();
      list = list.filter((item: any) =>
        (item.name ?? "").toLowerCase().includes(q)
      );
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      list = list.filter((item: any) => (Number(item.price) ?? 0) >= min);
    }
    if (!isNaN(max)) {
      list = list.filter((item: any) => (Number(item.price) ?? 0) <= max);
    }

    if (inStockOnly) {
      list = list.filter((item: any) => item.in_stock);
    }

    if (selectedSort === "price-low") {
      list.sort((a: any, b: any) => (Number(a.price) ?? 0) - (Number(b.price) ?? 0));
    } else if (selectedSort === "price-high") {
      list.sort((a: any, b: any) => (Number(b.price) ?? 0) - (Number(a.price) ?? 0));
    }

    return list;
  }, [products, debouncedQuery, minPrice, maxPrice, inStockOnly, selectedSort]);

  // ⭐ Helper to format price (string or number)
  const formatPrice = (price: any) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "$0.00" : `$${numPrice.toFixed(2)}`;
  };

  // ⭐ Header height with minimal padding
  const headerTotalHeight =
    insets.top +
    HEADER_ROW_HEIGHT +
    (showSearch ? 12 + SEARCH_ROW_HEIGHT + 8 : 4); // ⭐ Reduced spacing

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        style={[styles.container, { backgroundColor: bg }]}
        edges={offlineBannerVisible ? [] : ["top"]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <FlatList
          // ⭐ Force a remount when the layout mode changes
          key={isSearching ? "list" : "grid"}
          data={isError ? [] : filteredProducts}
          keyExtractor={(item) => `${item.section}-${item.id}`}
          numColumns={isSearching ? 1 : 2}
          columnWrapperStyle={isSearching ? undefined : { gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{
            flexGrow: isError || filteredProducts.length === 0 ? 1 : undefined,
            paddingBottom: 40,
            gap: isSearching ? 0 : 12,
            // ⭐ Minimal padding - products start right under the header
            paddingTop: headerTotalHeight,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={() => {
            void refetch();
          }}
          // ⭐ Item separator for list mode
          ItemSeparatorComponent={
            isSearching
              ? () => <View style={{ height: 1, backgroundColor: inputBorder, marginLeft: 86 }} />
              : undefined
          }
          // ⭐ ListHeaderComponent with results count
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
                  <Text style={{ color: textColor, fontSize: 15, fontWeight: "600" }}>Results</Text>
                  <Text style={{ color: subText, fontSize: 13 }}>
                    {isDebouncing ? "…" : `${filteredProducts.length} results`}
                  </Text>
                </View>
              )}
            </Animated.View>
          }
          renderItem={({ item }) => {
            if (!isSearching) {
              // ⭐ 2-COLUMN GRID
              return (
                <View style={{ flex: 1 }}>
                  <ProductCard
                    product={item}
                    sectionTitle={meta.title}
                    accentColor={meta.accentColor}
                    fluid
                  />
                </View>
              );
            }

            // ⭐ SINGLE COLUMN LIST
            return (
              <TouchableOpacity
                onPress={() => {
                  // Navigate to product detail
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: bg,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: sheetInnerBg,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {item.image_filename ? (
                    <CachedImage
                      source={{ uri: item.image_filename }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      recyclingKey={String(item.id)}
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={20} color={subText} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ fontSize: 15, fontWeight: "500", color: textColor }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: subText, marginTop: 2 }}>
                    {meta.title}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>
                  {formatPrice(item.price)}
                </Text>
              </TouchableOpacity>
            );
          }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                color={meta.accentColor}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={
            isSearching && isDebouncing ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={meta.accentColor} />
                <Text style={{ color: subText, fontSize: 13, marginTop: 12 }}>Searching...</Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Text style={{ fontSize: 40 }}>🔍</Text>
                <Text style={{ color: subText, fontSize: 15, marginTop: 12 }}>
                  {isError
                    ? "Couldn't load products. Pull to retry."
                    : isSearching
                    ? `No results for "${debouncedQuery}"`
                    : "No products in this category."}
                </Text>
              </View>
            )
          }
        />

        {/* ⭐ FLOATING BLUR HEADER */}
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingTop: insets.top,
            overflow: 'hidden',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            ...(Platform.OS === 'ios' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }),
            ...(Platform.OS === 'android' && {
              elevation: 4,
            }),
          }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              {categoryIcon ? (
                <CachedImage
                  source={categoryIcon}
                  style={{ width: 40, height: 40, borderRadius: 8 }}
                  contentFit="contain"
                />
              ) : (
                <View
                  style={[styles.categoryIcon, { backgroundColor: meta.accentColor }]}
                >
                  <Ionicons name={meta.icon} size={20} color="#fff" />
                </View>
              )}
            </View>

            {/* ⭐ Search icon toggles search */}
            <TouchableOpacity
              onPress={showSearch ? closeSearch : openSearch}
              style={styles.searchToggleButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={22}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          {/* ⭐ SEARCH ROW */}
          {showSearch && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={[styles.searchRow, { paddingHorizontal: 16 }]}
            >
              <Animated.View
                layout={LinearTransition.duration(250)}
                style={[
                  styles.searchBar,
                  { backgroundColor: inputBg, borderColor: inputBorder, height: SEARCH_ROW_HEIGHT },
                ]}
              >
                <Ionicons name="search" size={18} color={subText} style={{ marginRight: 10 }} />
                <TextInput
                  ref={inputRef}
                  style={{ flex: 1, fontSize: 15, color: textColor }}
                  placeholder="Search this category..."
                  placeholderTextColor={subText}
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                />
                <TouchableOpacity onPress={openFilter} style={{ marginLeft: 8 }}>
                  <Ionicons name="options-outline" size={20} color={meta.accentColor} />
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={closeSearch}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={{ color: meta.accentColor, fontSize: 15, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </BlurView>
      </SafeAreaView>

      {/* ⭐ FILTER BOTTOM SHEET */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: sheetBg }}
        handleIndicatorStyle={{ backgroundColor: inputBorder, width: 40 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: textColor, marginBottom: 24, textAlign: "center" }}>
            Filters
          </Text>

          {/* Sort */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ionicons name="swap-vertical-outline" size={16} color={meta.accentColor} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>Sort By</Text>
            </View>
            <RadioButton.Group onValueChange={(val) => setSelectedSort(val)} value={selectedSort}>
              {sortOptions.map(({ key, label }) => (
                <RadioButton.Item
                  key={key}
                  label={label}
                  value={key}
                  color={meta.accentColor}
                  labelStyle={{
                    color: selectedSort === key ? meta.accentColor : textColor,
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

          {/* Price range */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ionicons name="pricetag-outline" size={16} color={meta.accentColor} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>Price Range</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TextInput
                style={[
                  styles.priceInput,
                  { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
                ]}
                placeholder="Min"
                placeholderTextColor={subText}
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text style={{ color: subText }}>–</Text>
              <TextInput
                style={[
                  styles.priceInput,
                  { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
                ]}
                placeholder="Max"
                placeholderTextColor={subText}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>

          {/* Availability */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ionicons name="checkmark-circle-outline" size={16} color={meta.accentColor} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>Availability</Text>
            </View>
            <Chip
              selected={inStockOnly}
              onPress={() => setInStockOnly((prev) => !prev)}
              mode={inStockOnly ? "flat" : "outlined"}
              showSelectedCheck
              style={{
                alignSelf: "flex-start",
                backgroundColor: inStockOnly ? meta.accentColor : sheetInnerBg,
                borderColor: inStockOnly ? meta.accentColor : inputBorder,
              }}
              textStyle={{
                color: inStockOnly ? "#fff" : textColor,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              In Stock Only
            </Chip>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={resetFilters} style={[styles.resetBtn, { borderColor: inputBorder }]}>
              <Ionicons name="refresh-outline" size={16} color={textColor} />
              <Text style={{ color: textColor, fontWeight: "600" }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeFilter}
              style={[styles.applyBtn, { backgroundColor: meta.accentColor }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Apply Filters</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: HEADER_ROW_HEIGHT,
  },
  backButton: { padding: 4, marginRight: 8 },
  searchToggleButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
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