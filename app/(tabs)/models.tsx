import { useColorScheme } from "@/components/useColorScheme";
import { SHOWCASE_MODELS } from "@/lib/mock-models";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModelsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const background = isDark ? "#0d0d0d" : "#ffffff";
  const cardBg = isDark ? "#151B28" : "#F5F6F8";
  const textColor = isDark ? "#ffffff" : "#111111";
  const subText = isDark ? "#A9AEC0" : "#6B7280";

  return (
    <View style={[styles.container, { backgroundColor: background, paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>3D Models</Text>
        <Text style={[styles.headerSubtitle, { color: subText }]}>
          Browse printable designs or upload your own
        </Text>
      </View>

      <Pressable
        style={[styles.uploadCta, { backgroundColor: "#FF6B00" }]}
        onPress={() => router.push("/model-upload")}
      >
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
        <View style={{ flex: 1 }}>
          <Text style={styles.uploadCtaTitle}>Upload your own model</Text>
          <Text style={styles.uploadCtaSubtitle}>Preview it and request a print</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </Pressable>

      <FlatList
        data={SHOWCASE_MODELS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 120, paddingTop: 4 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() => router.push({ pathname: "/model-detail", params: { id: item.id } })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={[styles.cardName, { color: textColor }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.cardMeta, { color: subText }]} numberOfLines={1}>
                {item.material} · ~{item.printTimeHours}h
              </Text>
              <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  headerSubtitle: { fontSize: 13, marginTop: 4 },
  uploadCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  uploadCtaTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  uploadCtaSubtitle: { color: "#FFE4CC", fontSize: 12, marginTop: 2 },
  card: { flex: 1, borderRadius: 16, overflow: "hidden" },
  thumbnail: { width: "100%", aspectRatio: 1, backgroundColor: "#00000010" },
  cardBody: { padding: 10, gap: 2 },
  cardName: { fontSize: 13, fontWeight: "700" },
  cardMeta: { fontSize: 11 },
  cardPrice: { fontSize: 14, fontWeight: "800", color: "#FF6B00", marginTop: 2 },
});