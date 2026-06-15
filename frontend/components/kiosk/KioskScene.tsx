"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { KioskState } from "@/types";
import VrmAvatar from "./VrmAvatar";

const debugOrbitControls =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEBUG_AVATAR_CONTROLS === "true";

const CameraAim = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 1.28, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
};

const KioskScene = ({
  state,
  isSpeaking,
  audioElement,
  speechBoundaryPulse,
  compact = false,
  mini = false,
}: {
  state: KioskState;
  isSpeaking: boolean;
  audioElement?: HTMLAudioElement | null;
  speechBoundaryPulse?: number;
  compact?: boolean;
  mini?: boolean;
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-[radial-gradient(circle_at_50%_12%,#fffaf1,#f9ead2_48%,#f3dfc2)] ${
        mini ? "h-14 min-h-14 w-14 bg-[#fff4e6]" : compact ? "h-[360px] min-h-[360px]" : "h-[calc(100vh-150px)] min-h-[620px] rounded-lg border"
      }`}
    >
      {!compact && !mini && (
        <div className="absolute left-4 top-4 z-10 rounded-full border bg-white/90 px-3 py-1 text-xs font-medium capitalize text-gray-700 shadow-sm">
          {state}
        </div>
      )}
      <Canvas
        className={debugOrbitControls ? "" : "pointer-events-none"}
        camera={{ position: mini ? [0, 1.58, 1.18] : compact ? [0, 1.34, 2.18] : [0, 1.35, 2.05], fov: mini ? 25 : compact ? 29 : 27, near: 0.05, far: 20 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <CameraAim />
        <ambientLight intensity={1.6} />
        <directionalLight position={[2.5, 4, 3]} intensity={2.35} />
        <directionalLight position={[-2, 2.4, 1.5]} intensity={0.75} />
        <Suspense fallback={null}>
          <VrmAvatar
            avatarState={state}
            isSpeaking={isSpeaking}
            audioElement={audioElement}
            speechBoundaryPulse={speechBoundaryPulse}
          />
        </Suspense>
        {debugOrbitControls && (
          <OrbitControls
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
            enableDamping={false}
            minDistance={1.25}
            maxDistance={3.2}
            minPolarAngle={Math.PI / 2.9}
            maxPolarAngle={Math.PI / 2.02}
            target={[0, 1.22, 0]}
          />
        )}
      </Canvas>
      {!mini && <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#fffaf1] to-transparent" />}
      {!compact && !mini && (
        <div className="absolute bottom-4 left-1/2 w-[82%] -translate-x-1/2 rounded-md border bg-white/88 px-3 py-2 text-center text-xs text-gray-600 shadow-sm">
          VRoid sales assistant
        </div>
      )}
    </div>
  );
};

export default KioskScene;
