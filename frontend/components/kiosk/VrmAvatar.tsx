"use client";

import { useFrame } from "@react-three/fiber";
import { KioskState } from "@/types";
import { useVrmAvatar } from "@/hooks/useVrmAvatar";
import { resetMouthExpressions, useVrmLipSync } from "@/hooks/useVrmLipSync";
import { useVrmGestures } from "@/hooks/useVrmGestures";
import { useVrmExpressions } from "@/hooks/useVrmExpressions";

const VrmAvatar = ({
  avatarState,
  isSpeaking,
  audioElement,
  speechBoundaryPulse,
}: {
  avatarState: KioskState;
  isSpeaking: boolean;
  audioElement?: HTMLAudioElement | null;
  speechBoundaryPulse?: number;
}) => {
  const vrm = useVrmAvatar();

  useVrmExpressions({ vrm, avatarState, enabled: true });
  useVrmLipSync({ vrm, isSpeaking, audioElement, speechBoundaryPulse, intensity: 0.9, enabled: true });
  useVrmGestures({ vrm, avatarState, enabled: true });

  useFrame((_, delta) => {
    if (!vrm) return;
    vrm.update(delta);
    if (!isSpeaking) resetMouthExpressions(vrm);
  });

  if (!vrm) return null;
  return <primitive object={vrm.scene} />;
};

export default VrmAvatar;
