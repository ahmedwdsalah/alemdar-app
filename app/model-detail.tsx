import FilamentModelViewer from "@/components/models/FilamentModelViewer";
import OrderPrintSheet from "@/components/models/OrderPrintSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { SHOWCASE_MODELS } from "@/lib/mock-models";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [orderOpen, setOrderOpen] = useState(false);
  const isDark = useColorScheme() === "dark";

  const background = isDark ? "#0d0d0d" : "#ffffff";
  const sheetBg = isDark ? "#151515" : "#F4F4F5";
  const textColor = isDark ? "#ffffff" : "#111111";
  const subText = isDark ? "#A9AEC0" : "#6B6B6B";
  const backBtnBg = isDark ? "#00000060" : "#FFFFFFB0";
  const backBtnIcon = isDark ? "#fff" : "#111111";

  const model = SHOWCASE_MODELS.find((m) => m.id === id);

  if (!model) {
    return (
      <View style={[styles.notFound, { backgroundColor: background }]}>
        <Text style={{ color: textColor }}>Model not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <FilamentModelViewer glbUrl={model.glbUrl} />

      <Pressable
        style={[styles.backBtn, { top: insets.top + 12, backgroundColor: backBtnBg }]}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={22} color={backBtnIcon} />
      </Pressable>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20, backgroundColor: sheetBg }]}>
        <Text style={[styles.name, { color: textColor }]}>{model.name}</Text>
        <Text style={[styles.description, { color: subText }]}>{model.description}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: subText }]}>{model.material}</Text>
          <Text style={[styles.metaDot, { color: subText }]}>·</Text>
          <Text style={[styles.metaText, { color: subText }]}>~{model.printTimeHours}h print</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.price}>${model.price.toFixed(2)}</Text>
          <Pressable style={styles.orderBtn} onPress={() => setOrderOpen(true)}>
            <Text style={styles.orderBtnText}>Order this print</Text>
          </Pressable>
        </View>
      </View>

      <OrderPrintSheet
        visible={orderOpen}
        onClose={() => setOrderOpen(false)}
        source="catalog"
        catalogModelId={model.id}
        defaultMaterial={model.material}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 6,
  },
  name: { fontSize: 20, fontWeight: "800" },
  description: { fontSize: 13, lineHeight: 19 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaText: { fontSize: 12, fontWeight: "600" },
  metaDot: {},
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  price: { color: "#FF6B00", fontSize: 22, fontWeight: "800" },
  orderBtn: { backgroundColor: "#FF6B00", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  orderBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});