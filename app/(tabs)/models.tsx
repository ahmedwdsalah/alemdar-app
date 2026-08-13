import { useColorScheme } from "@/components/useColorScheme";
import { SHOWCASE_MODELS } from "@/lib/mock-models";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModelsScreen() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const background = isDark ? "#0d0d0d" : "#ffffff";
  const border = isDark ? "#232323" : "#EAEAEA";
  const textColor = isDark ? "#ffffff" : "#111111";
  const subText = isDark ? "#8A8A8A" : "#8E8E93";

  return (
    <View style={[styles.container, { backgroundColor: background, paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>3D Models</Text>
        <Text style={[styles.headerSubtitle, { color: subText }]}>
          Browse printable designs or upload your own
        </Text>
      </View>

      <FlatList
        data={SHOWCASE_MODELS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item, index }) => (
          <>
            <Pressable
              style={[styles.card, { borderColor: border }]}
              onPress={() => router.push({ pathname: "/model-detail", params: { id: item.id } })}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
              <View style={styles.cardBody}>
                {index === 0 && <Text style={styles.eyebrow}>FEATURED</Text>}
                <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
                <Text style={[styles.description, { color: subText }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.footer}>
                  <Text style={[styles.price, { color: textColor }]}>${item.price.toFixed(2)}</Text>
                  <View style={styles.viewLink}>
                    <Text style={styles.viewLinkText}>View</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FF6B00" />
                  </View>
                </View>
              </View>
            </Pressable>

            {index === 0 && (
              <Pressable
                style={[styles.uploadRow, { borderColor: border }]}
                onPress={() => router.push("/model-upload")}
              >
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#FF6B00" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uploadRowTitle, { color: textColor }]}>Upload your own model</Text>
                  <Text style={[styles.uploadRowSubtitle, { color: subText }]}>
                    Preview it and request a print
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={subText} />
              </Pressable>
            )}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 4 },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumbnail: { width: "100%", aspectRatio: 16 / 10, backgroundColor: "#00000006" },
  cardBody: { padding: 16, gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1, color: "#FF6B00" },
  name: { fontSize: 17, fontWeight: "700", marginTop: 2 },
  description: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  price: { fontSize: 16, fontWeight: "700" },
  viewLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewLinkText: { color: "#FF6B00", fontSize: 13, fontWeight: "600" },

  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 14,
  },
  uploadIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B0015",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadRowTitle: { fontSize: 14, fontWeight: "600" },
  uploadRowSubtitle: { fontSize: 12, marginTop: 1 },
});