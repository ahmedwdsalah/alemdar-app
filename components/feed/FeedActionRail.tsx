import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  liked: boolean;
  onLikePress: () => void;
  onSharePress: () => void;
}

export default function FeedActionRail({ liked, onLikePress, onSharePress }: Props) {
  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLikePress();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSharePress();
  };

  return (
    <View style={styles.rail}>
      <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={10}>
        <Ionicons
          name="heart"
          size={39}
          color={liked ? "#e8375a" : "#fff"}
        />
        <Text style={styles.label}>Like</Text>
      </Pressable>
      <Pressable onPress={handleShare} style={styles.actionBtn} hitSlop={10}>
        <Ionicons name="arrow-redo" size={37} color="#fff" />
        <Text style={styles.label}>Share</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: "absolute",
    right: 12,
    bottom: 260,
    alignItems: "center",
    gap: 22,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});