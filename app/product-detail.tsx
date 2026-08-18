import { CachedImage } from "@/components/CachedImage";
import { ProductCard } from "@/components/ProductCard";
import { Text } from "@/components/Themed";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useOfflineBannerVisible } from "@/hooks/useOfflineBanner";
import { usePrefetchImages } from "@/hooks/usePrefetchImages";
import { useProductDetail } from "@/hooks/useProductDetail";
import { useSimilarProducts } from "@/hooks/useSimilarProducts";
import { t, useLocale } from "@/lib/i18n";
import { resolveImageUrl } from "@/lib/image-url";
import { splitPrice } from "@/lib/price";
import { getSectionMeta } from "@/lib/section-meta";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  View as RNView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AMBER = "#FF6B00";

export default function ProductDetail() {
  useLocale();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, totalItems } = useCart(); // ⭐ Added totalItems
  const { convertPrice } = useCurrency();
  const isDark = useColorScheme() === "dark";
  const offlineBannerVisible = useOfflineBannerVisible();

  const productId = (params.productId as string) ?? "";
  const section = (params.section as string) ?? "main";
  const numericId = Number(productId);
  const detailId = Number.isInteger(numericId) ? numericId : null;
  const meta = getSectionMeta(section);
  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    fetchStatus: productFetchStatus,
    refetch: refetchProduct,
  } = useProductDetail(section, detailId);
  const isOnline = useIsOnline();
  const productUnavailableOffline =
    !product && !isOnline && productFetchStatus === "paused";
  const { data: similar } = useSimilarProducts(section, detailId);
  const relatedProducts = similar?.data ?? [];
  usePrefetchImages(relatedProducts.map((p) => p.image_filename));

  const name = product?.name ?? "Product";
  const priceRaw = product?.price ?? "";
  const image = resolveImageUrl(product?.image_filename) ?? "";
  const category = product?.category ?? "";
  const { whole, dec } = splitPrice(priceRaw);
  const priceInUSD = parseFloat(`${whole}.${dec}`);

  const [, setAdded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const PAGE_BG = isDark ? "#131825" : "#ffffff";
  const TEXT = isDark ? "#ffffff" : "#111111";
  const SUBTEXT = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const BORDER = isDark ? "rgba(255,255,255,0.45)" : "#ebebeb";
  const SKELETON = isDark ? "#1e2433" : "#e5e5ea";

  const handleAddToCart = () => {
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart({
      id: productId,
      name,
      price: whole,
      dec,
      categoryId: section,
      categoryTitle: meta.title,
      image: image || undefined,
    });
    setAdded(true);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 30, bounciness: 10 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 14 }),
    ]).start();
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setAdded(false));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAGE_BG }} edges={offlineBannerVisible ? ["bottom"] : ["top", "bottom"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={PAGE_BG} />

      <RNView style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={TEXT} />
        </TouchableOpacity>

       
        <TouchableOpacity onPress={() => router.push("/cart")} style={{ padding: 4 }}>
          <RNView>
            <Ionicons name="cart-outline" size={22} color={TEXT} />
            {totalItems > 0 && (
              <RNView
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  backgroundColor: "#e3342f",
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 3,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>
                  {totalItems}
                </Text>
              </RNView>
            )}
          </RNView>
        </TouchableOpacity>
      </RNView>

      {productUnavailableOffline ? (
        <RNView style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 }}>
          <Feather name="wifi-off" size={48} color={SUBTEXT} />
          <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700", textAlign: "center" }}>{t("offline.productUnavailable")}</Text>
          <TouchableOpacity onPress={() => refetchProduct()} style={{ backgroundColor: AMBER, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}>
            <Text style={{ color: "#000", fontWeight: "800" }}>Retry</Text>
          </TouchableOpacity>
        </RNView>
      ) : (
      <>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
        {/* IMAGE */}
        <RNView style={{ height: 300, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          {productLoading ? (
            <ActivityIndicator size="large" color={meta.accentColor} />
          ) : image ? (
            <CachedImage source={{ uri: image }} style={{ width: "100%", height: "100%", borderRadius: 12 }} contentFit="cover" recyclingKey={productId} />
          ) : (
            <Ionicons name="image-outline" size={80} color={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"} />
          )}
        </RNView>

        {productLoading ? (
          <>
            <RNView style={{ height: 30, width: "85%", borderRadius: 8, backgroundColor: SKELETON, marginBottom: 14 }} />
            <RNView style={{ height: 40, width: 150, borderRadius: 8, backgroundColor: SKELETON, marginBottom: 24 }} />
          </>
        ) : productError ? (
          <RNView style={{ alignItems: "center", paddingVertical: 24, gap: 12 }}>
            <Ionicons name="alert-circle-outline" size={36} color={SUBTEXT} />
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>Failed to load product</Text>
            <TouchableOpacity onPress={() => refetchProduct()} style={{ backgroundColor: AMBER, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}>
              <Text style={{ color: "#000", fontWeight: "800" }}>Retry</Text>
            </TouchableOpacity>
          </RNView>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: SUBTEXT, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
              {category || meta.title}
            </Text>
            <Text style={{ fontSize: 26, fontWeight: "800", color: TEXT, lineHeight: 32, letterSpacing: -0.5, marginBottom: 14 }}>{name}</Text>
            <Text style={{ fontSize: 30, fontWeight: "800", color: TEXT, marginBottom: 28 }}>{convertPrice(priceInUSD)}</Text>

            <RNView style={{ borderTopWidth: 1, borderTopColor: BORDER, marginBottom: 28 }}>
              {[
                { label: t("product.category"), value: category || meta.title },
                { label: t("product.sku"), value: `AT-${section.toUpperCase()}-${productId.padStart(3, "0")}` },
                { label: t("product.shipping"), value: t("product.shippingValue") },
              ].map((row) => (
                <RNView key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER }}>
                  <Text style={{ fontSize: 13, color: SUBTEXT }}>{row.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT }}>{row.value}</Text>
                </RNView>
              ))}
            </RNView>
          </>
        )}

        {relatedProducts.length > 0 && (
          <RNView style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: SUBTEXT, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>
              {t("product.moreFrom", { title: meta.title })}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
              {relatedProducts.map((rel) => (
                <ProductCard key={`${rel.section}-${rel.id}`} product={rel} sectionTitle={meta.title} accentColor={meta.accentColor} width={148} />
              ))}
            </ScrollView>
          </RNView>
        )}
      </ScrollView>

      {/* BOTTOM BAR */}
      <RNView style={{ borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 24, paddingVertical: 16 }}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: "#2ecc71", fontWeight: "600" }}>✓ {t("product.addedToCart")}</Text>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity onPress={handleAddToCart} disabled={!product || productLoading || productError} activeOpacity={0.85} style={{ backgroundColor: product && !productError ? TEXT : "#ccc", borderRadius: 10, height: 52, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: PAGE_BG }}>{productLoading ? "..." : t("addToCart")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </RNView>
      </>
      )}
    </SafeAreaView>
  );
}