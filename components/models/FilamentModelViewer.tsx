import { useColorScheme } from "@/components/useColorScheme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  ModelRenderer,
  useCameraManipulator,
  useModel,
} from "react-native-filament";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface Props {
  glbUrl: string;
  backgroundColor?: string;
}

function Scene({ glbUrl }: Pick<Props, "glbUrl">) {
  const model = useModel(
    { uri: glbUrl },
    {
      shouldReleaseSourceData: true,
      addToScene: true,
      instanceCount: 1,
    },
  );
  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: [0, 0, 5],
    targetPosition: [0, 0, 0],
    upVector: [0, 1, 0],
    zoomSpeed: [0.04],
    orbitSpeed: [0.003, 0.003],
  });

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      cameraManipulator?.grabBegin(event.x, -event.y, false);
    })
    .onUpdate((event) => {
      cameraManipulator?.grabUpdate(event.x, -event.y);
    })
    .onEnd(() => {
      cameraManipulator?.grabEnd();
    });

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    cameraManipulator?.scroll(
      event.focalX,
      event.focalY,
      (1 - event.scale) * 4,
    );
  });

  const gestures = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    <>
      <GestureDetector gesture={gestures}>
        <FilamentView style={styles.viewer}>
          <DefaultLight />
          <ModelRenderer
            model={model}
            transformToUnitCube
            castShadow
            receiveShadow
          />
          <Camera
            cameraManipulator={cameraManipulator}
            near={0.01}
            far={100}
            focalLengthInMillimeters={28}
          />
        </FilamentView>
      </GestureDetector>
      {model.state === "loading" && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      )}
    </>
  );
}

export default function FilamentModelViewer({ glbUrl, backgroundColor }: Props) {
  const isDark = useColorScheme() === "dark";

  // ⭐ Falls back to a theme-matched background when no explicit
  // backgroundColor is passed in. Pass backgroundColor as a prop
  // to override this on a per-screen basis if you ever need to.
  const resolvedBackground = backgroundColor ?? (isDark ? "#101928" : "#F1F3F6");

  return (
    <View style={[styles.container, { backgroundColor: resolvedBackground }]}>
      <FilamentScene>
        <Scene glbUrl={glbUrl} />
      </FilamentScene>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewer: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});