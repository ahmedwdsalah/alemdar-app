import React from "react";
import { StyleSheet, View } from "react-native";
import {
    Camera,
    DefaultLight,
    FilamentScene,
    FilamentView,
    Model,
    useCameraManipulator,
} from "react-native-filament";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface Props {
  glbUrl: string;
}

function Scene({ glbUrl }: Props) {
  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: [0, 0, 8],
    targetPosition: [0, 0, 0],
    orbitSpeed: [0.003, 0.003],
  });

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      cameraManipulator?.grabBegin(e.translationX, e.translationY,false);
    })
    .onUpdate((e) => {
      cameraManipulator?.grabUpdate(e.translationX, e.translationY);
    })
    .onEnd(() => {
      cameraManipulator?.grabEnd();
    });

  return (
    <GestureDetector gesture={panGesture}>
      <FilamentView style={styles.viewer}>
        <DefaultLight />
        <Model source={{ uri: glbUrl }} />
        <Camera cameraManipulator={cameraManipulator} />
      </FilamentView>
    </GestureDetector>
  );
}

export default function FilamentModelViewer({ glbUrl }: Props) {
  return (
    <View style={styles.container}>
      <FilamentScene>
        <Scene glbUrl={glbUrl} />
      </FilamentScene>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101928" },
  viewer: { flex: 1 },
});