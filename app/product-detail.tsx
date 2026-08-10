import { CachedImage } from "@/components/CachedImage";
import { ProductCard } from "@/components/ProductCard";
import { Text } from "@/components/Themed";
import { useCart } from "@/context/CartContext";
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
  const { addToCart } = useCart();
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

  const [, setAdded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const PAGE_BG = isDark ? "#0d0d0d" : "#ffffff";
  const CARD_BG = isDark ? "#0d0d0d" : "#ffffff";
  const TEXT = isDark ? "#ffffff" : "#111111";
  const SUBTEXT = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const BORDER = isDark ? "#1e2433" : "#ebebeb";
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
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 30,
        bounciness: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 14,
      }),
    ]).start();
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setAdded(false));
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: PAGE_BG }}
      edges={offlineBannerVisible ? ["bottom"] : ["top", "bottom"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={PAGE_BG}
      />

      {/* HEADER */}
      <RNView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: PAGE_BG,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: TEXT,
            flex: 1,
            textAlign: "center",
            marginHorizontal: 8,
          }}
          numberOfLines={1}
        >
          {productLoading || productUnavailableOffline ? meta.title : name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={{ padding: 4 }}
        >
          <Ionicons name="cart-outline" size={24} color={TEXT} />
        </TouchableOpacity>
      </RNView>

      {productUnavailableOffline ? (
        <RNView
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            gap: 16,
          }}
        >
          <Feather name="wifi-off" size={48} color={SUBTEXT} />
          <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
            {t("offline.productUnavailable")}
          </Text>
          <TouchableOpacity
            onPress={() => refetchProduct()}
            style={{ backgroundColor: AMBER, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}
          >
            <Text style={{ color: "#000", fontWeight: "800" }}>Retry</Text>
          </TouchableOpacity>
        </RNView>
      ) : (
      <>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* PRODUCT IMAGE */}
        <RNView
          style={{
            height: 280,
            backgroundColor: CARD_BG,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {productLoading ? (
            <ActivityIndicator size="large" color={meta.accentColor} />
          ) : image ? (
            <CachedImage
              source={{ uri: image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              recyclingKey={productId}
            />
          ) : (
            <Ionicons
              name="image-outline"
              size={80}
              color={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}
            />
          )}
        </RNView>

        <RNView
          style={{ height: 1, backgroundColor: BORDER, marginHorizontal: 16 }}
        />

        {/* PRODUCT INFO */}
        <RNView
          style={{ backgroundColor: CARD_BG, padding: 20, marginBottom: 8 }}
        >
          {productLoading ? (
            <>
              <RNView style={{ height: 28, width: "85%", borderRadius: 8, backgroundColor: SKELETON, marginBottom: 12 }} />
              <RNView style={{ height: 22, width: 100, borderRadius: 6, backgroundColor: SKELETON, marginBottom: 16 }} />
              <RNView style={{ height: 42, width: 150, borderRadius: 8, backgroundColor: SKELETON, marginBottom: 20 }} />
              <RNView style={{ height: 120, borderRadius: 12, backgroundColor: isDark ? "#0d1120" : "#f8f8fc" }} />
            </>
          ) : productError ? (
            <RNView style={{ alignItems: "center", paddingVertical: 24, gap: 12 }}>
              <Ionicons name="alert-circle-outline" size={36} color={SUBTEXT} />
              <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
                Failed to load product
              </Text>
              <TouchableOpacity
                onPress={() => refetchProduct()}
                style={{ backgroundColor: AMBER, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}
              >
                <Text style={{ color: "#000", fontWeight: "800" }}>Retry</Text>
              </TouchableOpacity>
            </RNView>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: TEXT,
                  lineHeight: 28,
                  marginBottom: 12,
                }}
              >
                {name}
              </Text>

              {/* Category tag */}
              <RNView style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <RNView
                  style={{
                    backgroundColor: isDark ? "#1e2433" : "#f0f0f5",
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, color: meta.accentColor, fontWeight: "600" }}>
                    {category || meta.title}
                  </Text>
                </RNView>
              </RNView>

              {/* Price */}
              <RNView style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, marginBottom: 20 }}>
                <Text style={{ fontSize: 36, fontWeight: "900", color: AMBER, lineHeight: 40 }}>{whole}</Text>
                <Text style={{ fontSize: 18, fontWeight: "700", color: AMBER, marginBottom: 4 }}>.{dec}</Text>
                <Text style={{ fontSize: 16, color: SUBTEXT, marginBottom: 6 }}>TL</Text>
              </RNView>

              {/* Details */}
              <RNView
                style={{
                  backgroundColor: isDark ? "#0d1120" : "#f8f8fc",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: TEXT, marginBottom: 10 }}>
                  {t("product.details")}
                </Text>
                {[
                  { label: t("product.category"), value: category || meta.title },
                  { label: t("product.sku"), value: `AT-${section.toUpperCase()}-${productId.padStart(3, "0")}` },
                  { label: t("product.shipping"), value: t("product.shippingValue") },
                ].map((row) => (
                  <RNView
                    key={row.label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 7,
                      borderBottomWidth: 1,
                      borderBottomColor: BORDER,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: SUBTEXT }}>{row.label}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: TEXT }}>{row.value}</Text>
                  </RNView>
                ))}
              </RNView>
            </>
          )}
        </RNView>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <RNView style={{ paddingTop: 8 }}>
            <RNView
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <RNView style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: meta.accentColor }} />
              <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT }}>
                {t("product.moreFrom", { title: meta.title })}
              </Text>
            </RNView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
            >
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={`${rel.section}-${rel.id}`}
                  product={rel}
                  sectionTitle={meta.title}
                  accentColor={meta.accentColor}
                  width={148}
                />
              ))}
            </ScrollView>
          </RNView>
        )}
      </ScrollView>

      {/* BOTTOM BAR */}
      <RNView
        style={{
          backgroundColor: PAGE_BG,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim, alignItems: "center", marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: "#2ecc71", fontWeight: "600" }}>
            ✓ {t("product.addedToCart")}
          </Text>
        </Animated.View>

        <RNView style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {/* Price pill — bigger */}
          <RNView
            style={{
              flex: 2,
              height: 52,
              backgroundColor: isDark ? "#1e2433" : "#f0f0f5",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "900", color: AMBER }}>
              {whole}
              <Text style={{ fontSize: 13, fontWeight: "700", color: AMBER }}>.{dec}</Text>
              <Text style={{ fontSize: 12, color: SUBTEXT, fontWeight: "400" }}> TL</Text>
            </Text>
          </RNView>

          {/* Add to Cart button — smaller */}
          <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={!product || productLoading || productError}
              activeOpacity={0.85}
              style={{
                backgroundColor: product && !productError ? AMBER : "#ccc",
                borderRadius: 14,
                height: 52,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Ionicons name="cart-outline" size={18} color="#000" />
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#000" }}>
                {productLoading ? "..." : t("addToCart")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </RNView>
      </RNView>
      </>
      )}
    </SafeAreaView>
  );
}