import FilamentModelViewer from "@/components/models/FilamentModelViewer";
import OrderPrintSheet from "@/components/models/OrderPrintSheet";
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

  const model = SHOWCASE_MODELS.find((m) => m.id === id);

  if (!model) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: "#fff" }}>Model not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilamentModelViewer glbUrl={model.glbUrl} />

      <Pressable
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.name}>{model.name}</Text>
        <Text style={styles.description}>{model.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{model.material}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>~{model.printTimeHours}h print</Text>
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
  container: { flex: 1, backgroundColor: "#101928" },
  notFound: { flex: 1, backgroundColor: "#101928", alignItems: "center", justifyContent: "center" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00000060",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: "#151B28",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 6,
  },
  name: { color: "#fff", fontSize: 20, fontWeight: "800" },
  description: { color: "#A9AEC0", fontSize: 13, lineHeight: 19 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaText: { color: "#A9AEC0", fontSize: 12, fontWeight: "600" },
  metaDot: { color: "#A9AEC0" },
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