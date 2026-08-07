import { CachedImage } from "@/components/CachedImage";
import { Text } from "@/components/Themed";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useOfflineBannerVisible } from "@/hooks/useOfflineBanner";
import { usePlaceOrder } from "@/hooks/usePlaceOrder";
import { formatCartItemsForOrder } from "@/lib/cart-order";
import { t, useLocale } from "@/lib/i18n";
import { loadDeliveryProfile } from "@/lib/profile-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  View as RNView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AMBER = "#FF6B00";

export default function CartScreen() {
  const router = useRouter();
  useLocale();
  const {
    items,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { convertPrice } = useCurrency();
  const { mutate: placeOrder, isPending: isPlacingOrder } = usePlaceOrder();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const offlineBannerVisible = useOfflineBannerVisible();

  const PAGE_BG = isDark ? "#0d0d0d" : "#ffffff";
  const CARD_BG = isDark ? "#131825" : "#ffffff";
  const TEXT = isDark ? "#ffffff" : "#111111";
  const SUBTEXT = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const BORDER = isDark ? "#1e2433" : "#ebebeb";

  const handlePlaceOrder = async () => {
    const profile = await loadDeliveryProfile();
    const fullAddress = [profile?.address, profile?.flat]
      .filter(Boolean)
      .join(", ");

    if (!profile?.phone) {
      Alert.alert(t("cart.missingAddress"), undefined, [
        {
          text: t("cart.addAddress"),
          onPress: () => router.push("/address-edit"),
        },
        { text: t("search.cancel"), style: "cancel" },
      ]);
      return;
    }

    const total = totalPrice.toFixed(2);
    placeOrder(
      {
        phone: profile.phone,
        name: profile.name || "Customer",
        address: fullAddress,
        city: profile.city || "Lefkoşa",
        total,
        discountedTotal: total,
        cartItemsFormatted: formatCartItemsForOrder(items),
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          clearCart();
          Alert.alert(t("cart.placeOrder"), t("cart.orderSuccess"));
        },
        onError: (error) => {
          Alert.alert(t("cart.orderFailed"), error.message);
        },
      },
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0d0d0d" : "#ffffff" }}
      edges={offlineBannerVisible ? ["bottom"] : ["top", "bottom"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#ffffff"}
      />

      <RNView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: isDark ? "#0d0d0d" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: TEXT }}>
          {t("cart.title")}{" "}
          {totalItems > 0 && (
            <Text style={{ color: AMBER }}>({totalItems})</Text>
          )}
        </Text>
        {items.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              clearCart();
            }}
            style={{ padding: 4 }}
          >
            <Text style={{ fontSize: 13, color: "#e3342f", fontWeight: "600" }}>
              {t("cart.clear")}
            </Text>
          </TouchableOpacity>
        ) : (
          <RNView style={{ width: 40 }} />
        )}
      </RNView>

      <RNView style={{ flex: 1, backgroundColor: PAGE_BG }}>
        {items.length === 0 ? (
          <RNView
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <RNView
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: isDark ? "#1e2433" : "#f0f0f5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="cart-outline" size={44} color={AMBER} />
            </RNView>
            <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT }}>
              {t("cart.empty")}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: SUBTEXT,
                textAlign: "center",
                paddingHorizontal: 40,
              }}
            >
              {t("cart.emptyDesc")}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginTop: 8,
                backgroundColor: AMBER,
                borderRadius: 12,
                paddingHorizontal: 32,
                paddingVertical: 13,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#000" }}>
                {t("cart.startShopping")}
              </Text>
            </TouchableOpacity>
          </RNView>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 16,
                gap: 12,
                paddingBottom: 160,
              }}
            >
              {items.map((item) => {
                const itemPrice = parseFloat(`${item.price}.${item.dec}`);
                return (
                  <RNView
                    key={`${item.categoryId}-${item.id}`}
                    style={{
                      backgroundColor: CARD_BG,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: BORDER,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <RNView
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 10,
                        backgroundColor: isDark ? "#1a2030" : "#f5f5fa",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {item.image ? (
                        <CachedImage
                          source={{ uri: item.image }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          recyclingKey={item.id}
                        />
                      ) : (
                        <Ionicons
                          name="image-outline"
                          size={28}
                          color={
                            isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.08)"
                          }
                        />
                      )}
                    </RNView>

                    <RNView style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: AMBER,
                          fontWeight: "600",
                          marginBottom: 3,
                        }}
                      >
                        {item.categoryTitle}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: TEXT,
                          lineHeight: 18,
                          marginBottom: 6,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: AMBER,
                        }}
                      >
                        {convertPrice(itemPrice)}
                      </Text>
                    </RNView>

                    <RNView style={{ alignItems: "center", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          removeFromCart(item.id, item.categoryId);
                        }}
                        style={{ padding: 4 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#e3342f"
                        />
                      </TouchableOpacity>

                      <RNView
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 0,
                          backgroundColor: isDark ? "#0d1120" : "#f0f0f5",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            updateQty(
                              item.id,
                              item.categoryId,
                              item.quantity - 1,
                            );
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="remove" size={16} color={TEXT} />
                        </TouchableOpacity>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: TEXT,
                            minWidth: 24,
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            updateQty(
                              item.id,
                              item.categoryId,
                              item.quantity + 1,
                            );
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="add" size={16} color={TEXT} />
                        </TouchableOpacity>
                      </RNView>
                    </RNView>
                  </RNView>
                );
              })}
            </ScrollView>

            <RNView
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: isDark ? "#0d0d0d" : "#ffffff",
                borderTopWidth: 1,
                borderTopColor: BORDER,
                padding: 16,
                paddingBottom: 28,
              }}
            >
              <RNView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 13, color: SUBTEXT }}>
                  {totalItems}{" "}
                  {t(totalItems !== 1 ? "cart.items" : "cart.item")}
                </Text>
                <Text style={{ fontSize: 13, color: SUBTEXT }}>
                  {t("cart.subtotal")}
                </Text>
              </RNView>
              <RNView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 13, color: SUBTEXT }}>
                  {t("cart.delivery")}{" "}
                  <Text style={{ color: "#2ecc71", fontWeight: "700" }}>
                    {t("cart.freeDelivery")}
                  </Text>
                </Text>
                <Text style={{ fontSize: 22, fontWeight: "900", color: TEXT }}>
                  {convertPrice(totalPrice)}
                </Text>
              </RNView>

              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={isPlacingOrder}
                activeOpacity={0.85}
                style={{
                  backgroundColor: AMBER,
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  opacity: isPlacingOrder ? 0.7 : 1,
                }}
              >
                {isPlacingOrder ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#000"
                  />
                )}
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#000" }}
                >
                  {isPlacingOrder
                    ? t("cart.placingOrder")
                    : t("cart.placeOrder")}
                </Text>
              </TouchableOpacity>
            </RNView>
          </>
        )}
      </RNView>
    </SafeAreaView>
  );
}
