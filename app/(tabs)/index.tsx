import FacebookIcon from "@/assets/icons/facebook.svg";
import GoogleMapIcon from "@/assets/icons/google_map.svg";
import InstagramIcon from "@/assets/icons/instagram.svg";
import { CachedImage } from "@/components/CachedImage";
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { HomeProductSection } from "@/components/HomeProductSection";
import { Text } from "@/components/Themed";
import { useCart } from "@/context/CartContext";
import { useOfflineBannerVisible } from "@/hooks/useOfflineBanner";
import { categoryIcons } from "@/lib/category-icons";
import { t, useLocale } from "@/lib/i18n";
import { HOME_SECTIONS } from "@/lib/section-meta";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";

import {
  Dimensions,
  Linking,
  View as RNView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import {
  Extrapolation,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { openSheet } from "./_layout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AMBER = "#FF6B00";
const BANNER_HEIGHT = 200;

//  Banner slides
const bannerSlides = [
  {
    id: "1",
    section: "search",
    icon: "bulb-outline",
    topLabelKey: "banner.slide1.topLabel",
    titleKey: "banner.slide1.title",
    subtitleKey: "banner.slide1.subtitle",
    backgroundColor: "#0e2a5a",
    accentColor: AMBER,
  },
  {
    id: "2",
    section: "arduino",
    icon: "hardware-chip-outline",
    topLabelKey: "banner.slide2.topLabel",
    titleKey: "banner.slide2.title",
    subtitleKey: "banner.slide2.subtitle",
    backgroundColor: "#3a1a00",
    accentColor: AMBER,
  },
  {
    id: "3",
    section: "solardb",
    icon: "sunny-outline",
    topLabelKey: "banner.slide3.topLabel",
    titleKey: "banner.slide3.title",
    subtitleKey: "banner.slide3.subtitle",
    backgroundColor: "#0e2a5a",
    accentColor: AMBER,
  },
  {
    id: "4",
    section: "sound",
    icon: "musical-notes-outline",
    topLabelKey: "banner.slide4.topLabel",
    titleKey: "banner.slide4.title",
    subtitleKey: "banner.slide4.subtitle",
    backgroundColor: "#3a1a00",
    accentColor: AMBER,
  },
];

// ⭐ CATEGORIES using categoryIcons
const categories = [
  {
    id: "1",
    nameKey: "categories.solar",
    section: "solardb",
    icon: categoryIcons.solardb,
  },
  {
    id: "2",
    nameKey: "categories.arduino",
    section: "arduino",
    icon: categoryIcons.arduino,
  },
  {
    id: "3",
    nameKey: "categories.sound",
    section: "sound",
    icon: categoryIcons.sound,
  },
  {
    id: "4",
    nameKey: "categories.batteries",
    section: "batteries",
    icon: categoryIcons.batteries,
  },
  {
    id: "5",
    nameKey: "categories.chargers",
    section: "chargers",
    icon: categoryIcons.chargers,
  },
  {
    id: "6",
    nameKey: "categories.adapters",
    section: "adapters",
    icon: categoryIcons.adapters,
  },
  {
    id: "7",
    nameKey: "categories.lamps",
    section: "lamps",
    icon: categoryIcons.lamps,
  },
  {
    id: "8",
    nameKey: "categories.mexxsun",
    section: "mexxsun",
    icon: categoryIcons.mexxsun,
  },
  {
    id: "9",
    nameKey: "categories.filaments",
    section: "filaments",
    icon: categoryIcons.filaments,
  },
  {
    id: "10",
    nameKey: "categories.tv_remotes",
    section: "tv_remotes",
    icon: categoryIcons.tv_remotes,
  },
  {
    id: "11",
    nameKey: "categories.fans",
    section: "fans",
    icon: categoryIcons.fans,
  },
  {
    id: "12",
    nameKey: "categories.electric",
    section: "electric",
    icon: categoryIcons.electric,
  },
  {
    id: "13",
    nameKey: "categories.screwdrivers",
    section: "scrawesdriver",
    icon: categoryIcons.scrawesdriver,
  },
  {
    id: "14",
    nameKey: "categories.spray_gum",
    section: "spray_gum",
    icon: categoryIcons.spray_gum,
  },
];

// ─── CATEGORY TILE
function CategoryTile({
  icon,
  nameKey,
  onPress,
}: {
  icon: number;
  nameKey: string;
  onPress: () => void;
}) {
  const isDark = useColorScheme() === 'dark';
  const TEXT = isDark ? '#ffffff' : '#111111';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={t(nameKey)}
      accessibilityRole="button"
      style={{ alignItems: 'center', width: 72 }}
    >
      <CachedImage
        source={icon}
        style={{ width: 72, height: 72 }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: TEXT,
          textAlign: 'center',
          marginTop: 4,
        }}
        numberOfLines={1}
      >
        {t(nameKey)}
      </Text>
    </TouchableOpacity>
  );
}

// brands
const brands = [
  { id: "1", name: "ARDUINO", color: "#00979d" },
  { id: "2", name: "ESPRESSIF", color: "#e3342f" },
  { id: "3", name: "MEXXSUN", color: "#10b981" },
  { id: "4", name: "WEKO", color: "#f5a623" },
  { id: "5", name: "VARTA", color: "#1d4ed8" },
  { id: "6", name: "ORION", color: "#7c3aed" },
  { id: "7", name: "MARXLOW", color: "#06b6d4" },
];

// ─── REPAIR SERVICE CARD
const repairSteps = [
  { icon: "call-outline", labelKey: "home.repair.step1" },
  { icon: "bicycle-outline", labelKey: "home.repair.step2" },
  { icon: "construct-outline", labelKey: "home.repair.step3" },
  { icon: "home-outline", labelKey: "home.repair.step4" },
];

function RepairServiceCard({ isDark, BORDER }: any) {
  const [phone, setPhone] = useState("");
  const cardBg = isDark ? "#1a1206" : "#f5f0e8";
  const textDark = isDark ? "#ffffff" : "#111111";
  const subText = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const inputBg = isDark ? "#0d0d0d" : "#ffffff";

  return (
    <RNView
      style={{
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
        borderRadius: 16,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: isDark ? "#2a1f0a" : "#e8dcc8",
        padding: 18,
      }}
    >
      {/* Title */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: textDark,
          marginBottom: 2,
        }}
      >
        {t("home.repair.title")}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: AMBER,
          marginBottom: 16,
        }}
      >
        {t("home.repair.subtitle")}
      </Text>

      {/* Steps */}
      <RNView
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}
      >
        {repairSteps.map((step, index) => (
          <RNView
            key={step.labelKey}
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          >
            <RNView style={{ alignItems: "center", flex: 1 }}>
              <RNView
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDark ? "#3a2a0a" : "#d4c4a0",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 5,
                  backgroundColor: isDark ? "#221a08" : "#ede3ce",
                }}
              >
                <Ionicons name={step.icon as any} size={18} color={AMBER} />
              </RNView>
              <Text
                style={{
                  fontSize: 9,
                  color: subText,
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {t(step.labelKey)}
              </Text>
            </RNView>
            {index < repairSteps.length - 1 && (
              <Text
                style={{
                  color: AMBER,
                  fontSize: 12,
                  marginBottom: 14,
                  opacity: 0.6,
                }}
              >
                →
              </Text>
            )}
          </RNView>
        ))}
      </RNView>

      {/* Phone input */}
      <Text style={{ fontSize: 11, color: subText, marginBottom: 8 }}>
        {t("home.repair.leaveNumber")}
      </Text>
      <RNView
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: inputBg,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: BORDER,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: textDark,
            marginRight: 6,
          }}
        >
          TR +90
        </Text>
        <RNView
          style={{
            width: 1,
            height: 16,
            backgroundColor: BORDER,
            marginRight: 10,
          }}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="5__ __ __ __"
          placeholderTextColor={
            isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
          }
          keyboardType="phone-pad"
          maxLength={10}
          style={{ flex: 1, fontSize: 14, color: textDark }}
        />
      </RNView>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        activeOpacity={0.85}
        style={{
          backgroundColor: AMBER,
          borderRadius: 10,
          paddingVertical: 13,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Ionicons name="call-outline" size={16} color="#000" />
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#000" }}>
          {t("home.repair.callBack")}
        </Text>
      </TouchableOpacity>
    </RNView>
  );
}

//  MAIN COMPONENT
export default function HomeScreen() {
  useLocale();
  const router = useRouter();
  const { totalItems } = useCart();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const offlineBannerVisible = useOfflineBannerVisible();

  const PAGE_BG = isDark ? "#0d0d0d" : "#ffffff";
  const HEADER_BG = isDark ? "#0d0d0d" : "#fffefe";
  const CARD_BG = isDark ? "#131825" : "#ffffff";
  const TEXT = isDark ? "#ffffff" : "#111111";
  const SUBTEXT = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const BORDER = isDark ? "#1e2433" : "#ebebeb";
  const SEARCH_BG = isDark ? "#0B1525" : "#f0f0f5";
  const ICON_COLOR = isDark ? "#ffffff" : "#111111";
  const SEARCH_PH = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

  const bannerProgress = useSharedValue(0);
  const bannerRef = useRef<ICarouselInstance>(null);

  const onPressBannerPagination = (index: number) => {
    bannerRef.current?.scrollTo({
      count: index - bannerProgress.value,
      animated: true,
    });
  };

  // ── Banner Slide ─────────────────────────────────────────────
  const renderBannerSlide = ({ item }: { item: (typeof bannerSlides)[0] }) => (
    <RNView
      style={{
        width: SCREEN_WIDTH - 32,
        height: BANNER_HEIGHT,
        borderRadius: 12,
        backgroundColor: item.backgroundColor,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: isDark ? AMBER : "#0d0d0d",
      }}
    >
      {/* Text content - left side */}
      <RNView style={{ flex: 1, paddingRight: 16 }}>
        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            fontWeight: "600",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {t(item.topLabelKey)}
        </Text>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "900",
            color: item.accentColor,
            letterSpacing: 1,
            marginTop: 2,
          }}
        >
          {t(item.titleKey)}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            marginTop: 4,
            lineHeight: 16,
          }}
        >
          {t(item.subtitleKey)}
        </Text>

        {/* Shop Now Button */}
        <TouchableOpacity
          style={{
            marginTop: 12,
            alignSelf: "flex-start",
            backgroundColor: item.accentColor,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (item.section === "search") {
              router.push("/search");
            } else {
              router.push({
                pathname: "/category-detail",
                params: { section: item.section },
              });
            }
          }}
        >
          <Text style={{ color: "#000", fontSize: 11, fontWeight: "700" }}>
            {t("shopNow")}
          </Text>
        </TouchableOpacity>
      </RNView>

      {/* Icon on the right side */}
      <RNView style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons
          name={item.icon as React.ComponentProps<typeof Ionicons>["name"]}
          size={56}
          color={item.accentColor}
        />
      </RNView>
    </RNView>
  );

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: HEADER_BG }}
      edges={offlineBannerVisible ? [] : ["top"]}
    >
      {/* HEADER */}
      <RNView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: HEADER_BG,
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 10,
          zIndex: 999,
        }}
      >
        <RNView>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: TEXT,
              letterSpacing: 0.3,
            }}
          >
            Alemdar <Text style={{ color: AMBER }}>Teknik</Text>
          </Text>
          <RNView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              marginTop: 2,
            }}
          >
            <Ionicons name="location-sharp" size={14} color={AMBER} />
            <Text style={{ fontSize: 10, color: SUBTEXT }}>
              {t("home.location")}
            </Text>
          </RNView>
        </RNView>

        {/* ⭐ Right side icons - Language replaced with Currency Switcher */}
        <RNView style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
          {/* Currency Switcher (replaces Language) */}
          <CurrencySwitcher />

          {/* Notification Icon */}
          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={ICON_COLOR} />
          </TouchableOpacity>

          {/* Settings Icon */}
          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => openSheet("settings")}
          >
            <Ionicons name="settings-outline" size={22} color={ICON_COLOR} />
          </TouchableOpacity>

          {/* Cart Icon */}
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={{ padding: 6 }}
          >
            <RNView>
              <Ionicons name="cart-outline" size={22} color={ICON_COLOR} />
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
      </RNView>

      {/* SEARCH */}
      <RNView
        style={{
          flexDirection: "row",
          gap: 8,
          backgroundColor: HEADER_BG,
          paddingHorizontal: 16,
          paddingBottom: 14,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/search")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: SEARCH_BG,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={16} color={SEARCH_PH} style={{ marginRight: 8 }} />
          <Text style={{ flex: 1, fontSize: 13, color: SEARCH_PH }}>
            {t("home.searchPlaceholder")}
          </Text>
        </TouchableOpacity>
      </RNView>

      {/* BODY */}
      <ScrollView
        style={{ flex: 1, backgroundColor: PAGE_BG }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
      >
        {/* CATEGORIES */}
        <RNView
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: TEXT }}>
            {t("home.categories")}
          </Text>
        </RNView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          style={{ marginBottom: 24 }}
        >
          {categories.map((cat) => {
            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({
                pathname: "/category-detail",
                params: { section: cat.section },
              });
            };

            return (
              <CategoryTile
                key={cat.id}
                icon={cat.icon}
                nameKey={cat.nameKey}
                onPress={onPress}
              />
            );
          })}
        </ScrollView>

        {/* BANNER */}
        <RNView style={{ marginHorizontal: 16, marginBottom: 4 }}>
          <Carousel
            ref={bannerRef}
            loop
            autoPlay
            pagingEnabled
            snapEnabled
            width={SCREEN_WIDTH - 32}
            height={BANNER_HEIGHT}
            autoPlayInterval={3500}
            data={bannerSlides}
            onProgressChange={(_, absoluteProgress) => {
              bannerProgress.value = absoluteProgress;
            }}
            renderItem={renderBannerSlide}
          />
          <Pagination.Custom
            progress={bannerProgress}
            data={bannerSlides}
            size={7}
            dotStyle={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: isDark ? "#3a3a3a" : "#ccc",
            }}
            activeDotStyle={{
              width: 20,
              height: 7,
              borderRadius: 4,
              backgroundColor: AMBER,
            }}
            containerStyle={{
              gap: 6,
              paddingTop: 10,
              paddingBottom: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
            horizontal
            onPress={onPressBannerPagination}
            customReanimatedStyle={(progress, index, length) => {
              "worklet";

              let distance = Math.abs(progress - index);

              if (index === 0 && progress > length - 1) {
                distance = Math.abs(progress - length);
              }

              return {
                transform: [
                  {
                    scale: interpolate(
                      distance,
                      [0, 1],
                      [1.08, 1],
                      Extrapolation.CLAMP,
                    ),
                  },
                ],
              };
            }}
          />
        </RNView>

        {/* BRANDS */}
        <RNView
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: TEXT }}>
             {t("home.brands")}
          </Text>
        </RNView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={{
                paddingHorizontal: 16,
                height: 34,
                backgroundColor: PAGE_BG,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: isDark ? AMBER : "#0d0d0d",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/search",
                  params: { query: brand.name },
                });
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? AMBER : "#0d0d0d",
                  letterSpacing: 0.8,
                }}
              >
                {brand.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DIVIDER */}
        <RNView
          style={{
            height: 1,
            backgroundColor: BORDER,
            marginHorizontal: 16,
            marginTop: 28,
            marginBottom: 28,
          }}
        />

        {/* PRODUCT SECTIONS (live API) */}
        <HomeProductSection sectionKey={HOME_SECTIONS[0]} />

        <RepairServiceCard isDark={isDark} BORDER={BORDER} />

        {HOME_SECTIONS.slice(1).map((key) => (
          <HomeProductSection key={key} sectionKey={key} />
        ))}

        {/* SOCIAL FOOTER */}
        <RNView style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 11,
              color: SUBTEXT,
              textAlign: "center",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {t("home.followUs")}
          </Text>
          <RNView style={{ flexDirection: "row", gap: 10 }}>
            {/* Facebook */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL("https://www.facebook.com/AlemdarTeknikLtd");
              }}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: CARD_BG,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <FacebookIcon width={32} height={32} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: TEXT }}>
                Facebook
              </Text>
            </TouchableOpacity>

            {/* Instagram */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(
                  "https://www.instagram.com/alemdarteknik?igsh=MTV3enhzczUxMGFiYg%3D%3D&utm_source=qr",
                );
              }}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: CARD_BG,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <InstagramIcon width={32} height={32} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: TEXT }}>
                Instagram
              </Text>
            </TouchableOpacity>

            {/* Location */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(
                  "https://www.google.com/maps?q=Alemdar+Teknik,+Polis+Sk,+Lefko%C5%9Fa+5000&ftid=0x14de17339227c4f7:0x4bb7a378a71dcdc7&entry=gps&shh=CAE&lucs=,94297699,94275415,94231188,94280568,47071704,94218641,94282134,94286869&g_ep=CAISEjI2LjA1LjEuODYxMzIyMjEwMBgAIMi8BypILDk0Mjk3Njk5LDk0Mjc1NDE1LDk0MjMxMTg4LDk0MjgwNTY4LDQ3MDcxNzA0LDk0MjE4NjQxLDk0MjgyMTM0LDk0Mjg2ODY5QgJDWQ%3D%3D&skid=6b7c7b7d-a985-4e3a-92a6-6e0ec7205e39&g_st=ic",
                );
              }}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: CARD_BG,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <GoogleMapIcon width={32} height={32} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: TEXT }}>
                Location
              </Text>
            </TouchableOpacity>
          </RNView>

          {/* Copyright */}
          <Text
            style={{
              fontSize: 11,
              color: SUBTEXT,
              textAlign: "center",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            {t("home.copyright")}
          </Text>
        </RNView>
      </ScrollView>
    </SafeAreaView>
  );
}