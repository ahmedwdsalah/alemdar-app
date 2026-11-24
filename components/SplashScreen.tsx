import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { PropsWithChildren, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import InfiniteCarousel, { CarouselItemRenderer } from "./carousel";

export type AlemdarCategory = {
  id: string | number;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

function DynamicBackground({ image }: { image?: ImageSourcePropType }) {
  if (!image) return null;
  const resolved = Image.resolveAssetSource(image);
  if (!resolved) return null;
  return (
    <Animated.Image
      key={resolved.uri}
      source={{ uri: resolved.uri }}
      resizeMode="cover"
      style={StyleSheet.absoluteFill}
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(800)}
    />
  );
}

function CategoryCard({ category }: { category: AlemdarCategory }) {
  return (
    <View style={styles.card}>
      <Image
        source={category.image}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.55)"]}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{category.title}</Text>
          <Text style={styles.cardSubtitle}>{category.subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const defaultCategories: AlemdarCategory[] = [
  {
    id: 1,
    image: require("@/assets/splash/solar.jpg"),
    title: "Solar Energy",
    subtitle: "Panels, inverters & solutions",
  },
  {
    id: 2,
    image: require("@/assets/splash/arduino.png"),
    title: "Arduino",
    subtitle: "Boards, modules & sensors",
  },
  {
    id: 3,
    image: require("@/assets/splash/sound.png"),
    title: "Sound Systems",
    subtitle: "Speakers, mixers & audio",
  },
  {
    id: 4,
    image: require("@/assets/splash/batteries.jpg"),
    title: "Batteries",
    subtitle: "Power for every project",
  },
  {
    id: 5,
    image: require("@/assets/splash/lamp.jpg"),
    title: "LED Lighting",
    subtitle: "Lamps, strips & fixtures",
  },
  {
    id: 6,
    image: require("@/assets/splash/charger.webp"),
    title: "Chargers",
    subtitle: "Fast & reliable power",
  },
  {
    id: 7,
    image: require("@/assets/splash/electric.jpg"),
    title: "Electric Tools",
    subtitle: "Professional grade equipment",
  },
  {
    id: 8,
    image: require("@/assets/splash/adapters.jpg"),
    title: "Adapters",
    subtitle: "Connect anything to anything",
  },
];

export type AlemdarSplashProps = PropsWithChildren<{
  data?: AlemdarCategory[];
  ctaLabel?: string;
  onCTAPress?: () => void;
  carouselSpeed?: number;
}>;

export default function SplashScreen({
  data = defaultCategories,
  ctaLabel = "Browse Products",
  onCTAPress = () => router.replace("/(tabs)"),
  carouselSpeed = 60,
}: AlemdarSplashProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();

  const bgUri = useMemo(() => data?.[activeIndex]?.image, [activeIndex, data]);

  return (
    <View style={styles.root}>
      <DynamicBackground image={bgUri} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.4)" },
        ]}
      />
      <BlurView intensity={65} style={StyleSheet.absoluteFill}>
        <SafeAreaView edges={["bottom"]} style={styles.safe}>
          <Animated.View
            entering={FadeIn.springify().damping(28)}
            style={[styles.carousel, { height: width * 1 }]}
          >
            <InfiniteCarousel<AlemdarCategory>
              carouselItems={data}
              onIndexChange={setActiveIndex}
              itemWidthRatio={0.65}
              autoPlaySpeed={carouselSpeed}
              renderItem={
                (({ item }) => (
                  <CategoryCard category={item} />
                )) as CarouselItemRenderer<AlemdarCategory>
              }
            />
          </Animated.View>
          <View style={styles.content}>
            <Text style={styles.title}>
              Alemdar<Text style={styles.titleAccent}>Teknik</Text>
            </Text>
            <Text style={styles.subtitle}>
              Your trusted source for electronics, components, and technical
              equipment.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCTAPress}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  carousel: { width: "100%", marginTop: 80 },
  content: { flex: 1, padding: 16, justifyContent: "center", gap: 16 },
  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
  },
  titleAccent: { color: "#FF6B00" },
  subtitle: {
    textAlign: "center",
    fontSize: 17,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 16,
  },
  cta: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 42,
    paddingVertical: 16,
  },
  ctaText: { fontSize: 17, fontWeight: "600", color: "#fff" },
  card: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  cardImage: { width: "100%", height: "100%" },
  cardGradient: { ...StyleSheet.absoluteFill, justifyContent: "flex-end" },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  cardSubtitle: { fontSize: 14, color: "#fff", marginTop: 4 },
});
