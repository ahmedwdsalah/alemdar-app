import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";

interface Props {
  fileUri: string;
}

export default function StlUploadViewer({ fileUri }: Props) {
  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x101928, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 7);
      scene.add(dirLight);

      const loader = new STLLoader();
      let mesh: THREE.Mesh | null = null;

      try {
        const response = await fetch(fileUri);
        const buffer = await response.arrayBuffer();
        const geometry = loader.parse(buffer);
        geometry.center();
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
          color: 0xff6b00,
          metalness: 0.1,
          roughness: 0.6,
        });
        mesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere?.radius ?? 5;
        camera.position.set(0, 0, radius * 2.5);
        camera.lookAt(0, 0, 0);

        scene.add(mesh);
      } catch (err) {
        console.error("Failed to parse STL for preview:", err);
      }

      const render = () => {
        requestAnimationFrame(render);
        if (mesh) {
          mesh.rotation.y += 0.008;
        }
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();
    },
    [fileUri]
  );

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101928" },
  glView: { flex: 1 },
});