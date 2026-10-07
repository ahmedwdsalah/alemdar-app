import { submitPrintOrder, type PrintOrderPayload } from "@/api/print-orders";
import BottomSheet, { type BottomSheetMethods } from "@devvie/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MATERIALS = ["PLA", "PLA+", "PETG", "ABS"];
const COLORS = ["Black", "White", "Orange", "Gray"];

interface Props {
  visible: boolean;
  onClose: () => void;
  source: "catalog" | "upload";
  catalogModelId?: string;
  fileUri?: string;
  fileName?: string;
  defaultMaterial?: string;
}

export default function OrderPrintSheet({
  visible,
  onClose,
  source,
  catalogModelId,
  fileUri,
  fileName,
  defaultMaterial,
}: Props) {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [material, setMaterial] = useState(defaultMaterial ?? MATERIALS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSubmitted(false);
      sheetRef.current?.open();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload: PrintOrderPayload = {
      source,
      catalogModelId,
      fileUri,
      fileName,
      material,
      color,
      quantity,
      notes: notes.trim() || undefined,
    };
    const result = await submitPrintOrder(payload);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      height={submitted ? 320 : 560}
      style={styles.sheet}
      closeOnDragDown
      closeOnBackdropPress
      onClose={onClose}
    >
      {submitted ? (
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Ionicons name="checkmark-circle" size={44} color="#1F883D" />
          </View>
          <Text style={styles.confirmTitle}>Order Sent</Text>
          <Text style={styles.confirmBody}>
            Your print request has been submitted. We&apos;ll confirm pricing
            and timing shortly.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Order this print</Text>
          {fileName ? <Text style={styles.fileLabel}>{fileName}</Text> : null}

          <Text style={styles.sectionLabel}>Material</Text>
          <View style={styles.chipRow}>
            {MATERIALS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMaterial(m)}
                style={[styles.chip, material === m && styles.chipActive]}
              >
                <Text style={[styles.chipText, material === m && styles.chipTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.chipRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[styles.chip, color === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, color === c && styles.chipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Ionicons name="remove" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => Math.min(20, q + 1))}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Infill %, tolerances, deadline, etc."
            placeholderTextColor="#6B7280"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Submit Order Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: "#101928", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  form: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32, gap: 4 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  fileLabel: { color: "#A9AEC0", fontSize: 13, marginBottom: 12 },
  sectionLabel: { color: "#A9AEC0", fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A2333",
    borderWidth: 1,
    borderColor: "#252F42",
  },
  chipActive: { backgroundColor: "#FF6B0020", borderColor: "#FF6B00" },
  chipText: { color: "#A9AEC0", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FF6B00" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A2333",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: "#fff", fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center" },
  notesInput: {
    backgroundColor: "#1A2333",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    minHeight: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#252F42",
  },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: "#FF6B00",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  confirmWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1F883D20",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  confirmBody: { color: "#A9AEC0", fontSize: 14, textAlign: "center" },
});