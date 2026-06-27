"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM } from "@pixiv/three-vrm";
import { useEffect, useMemo } from "react";
import { Box3, Vector3 } from "three";

const TARGET_DISPLAY_HEIGHT = 2.55;
const AVATAR_FACING_ROTATION = Math.PI;

export const useVrmAvatar = (url = "/models/avatar/avatar.vrm") => {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  const vrm = useMemo(() => gltf.userData.vrm as VRM | undefined, [gltf]);

  useEffect(() => {
    if (!vrm) return;
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.combineSkeletons(vrm.scene);

    vrm.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(vrm.scene);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const modelHeight = Math.max(size.y, 0.01);
    const scale = TARGET_DISPLAY_HEIGHT / modelHeight;

    vrm.scene.scale.setScalar(scale);
    vrm.scene.rotation.y = AVATAR_FACING_ROTATION;

    vrm.scene.updateMatrixWorld(true);
    const scaledBox = new Box3().setFromObject(vrm.scene);
    const scaledCenter = new Vector3();
    scaledBox.getCenter(scaledCenter);

    // Rotate by Math.PI because this VRM faces away from the kiosk camera by default.
    vrm.scene.position.set(-scaledCenter.x, -scaledBox.min.y - 0.78, -scaledCenter.z);

    if (process.env.NODE_ENV === "development") {
      const bones = Object.keys((vrm.humanoid as any)?.humanBones || {});
      const expressions = Object.keys((vrm.expressionManager as any)?._expressions || {});
      console.log("[VRM] normalized avatar", {
        originalHeight: modelHeight,
        targetHeight: TARGET_DISPLAY_HEIGHT,
        scale,
        originalBox: { min: box.min.toArray(), max: box.max.toArray() },
        scaledBox: { min: scaledBox.min.toArray(), max: scaledBox.max.toArray() },
        bones,
        expressions,
      });
    }
  }, [vrm]);

  return vrm;
};
