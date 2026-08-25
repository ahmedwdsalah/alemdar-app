import { CachedImage } from "@/components/CachedImage";
import type { FeedItem } from "@/lib/mock-feed";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  item: FeedItem;
  isActive: boolean;
}

// ⚠️ TEMP: video rendering disabled until expo-video is in the native build.
// The real VideoPage (using expo-video) will come back once that lands —
// see the commented-out version at the bottom of this file.
function VideoPagePlaceholder({ item }: Props) {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.videoPlaceholder]}>
      <Text style={styles.placeholderText}>Video preview unavailable{"\n"}(pending native build)</Text>
    </View>
  );
}

export default function FeedMediaItem({ item, isActive }: Props) {
  return (
    <View style={styles.container}>
      {item.type === "video" ? (
        <VideoPagePlaceholder item={item} isActive={isActive} />
      ) : (
        <CachedImage
          source={{ uri: item.uri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          recyclingKey={item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#151515" },
  placeholderText: { color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center" },
});

/*RESTORE ONCE expo-video IS IN THE NATIVE BUILD:

import { useEffect } from "react";
import { useVideoPlayer, VideoView } from "expo-video";

function VideoPage({ item, isActive }: Props) {
  const player = useVideoPlayer(item.uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

*/