"use client";

import { useFrame } from "@react-three/fiber";
import type { VRM } from "@pixiv/three-vrm";
import { useRef } from "react";
import type { KioskState } from "@/types";

const faceExpressions = [
  "happy",
  "relaxed",
  "neutral",
  "surprised",
  "sad",
  "angry",
  "blink",
  "blinkLeft",
  "blinkRight",
] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, alpha: number) => from + (to - from) * alpha;

const safeSetExpression = (vrm: VRM, name: string, value: number) => {
  try {
    vrm.expressionManager?.setValue(name, clamp01(value));
  } catch {
    if (process.env.NODE_ENV === "development") console.warn(`[VRM] expression missing: ${name}`);
  }
};

const expressionTargets = (state: KioskState): Record<string, number> => {
  switch (state) {
    case "greeting":
      return { happy: 0.58, relaxed: 0.2 };
    case "listening":
      return { neutral: 0.28, relaxed: 0.24 };
    case "thinking":
      return { relaxed: 0.32, neutral: 0.18 };
    case "talking":
      return { happy: 0.36, relaxed: 0.2 };
    case "presenting":
      return { happy: 0.42, relaxed: 0.18 };
    case "comparing":
      return { neutral: 0.28, relaxed: 0.16 };
    case "checkout":
      return { happy: 0.48, relaxed: 0.18 };
    case "error":
      return { sad: 0.28, neutral: 0.2 };
    case "idle":
    default:
      return { relaxed: 0.28, happy: 0.08 };
  }
};

export const useVrmExpressions = ({
  vrm,
  avatarState,
  enabled = true,
}: {
  vrm?: VRM | null;
  avatarState: KioskState;
  enabled?: boolean;
}) => {
  const valuesRef = useRef<Record<string, number>>({});
  const nextBlinkAtRef = useRef(0.8);
  const blinkEndAtRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!vrm || !enabled) return;

    const t = clock.elapsedTime;
    const target = expressionTargets(avatarState);

    if (t > nextBlinkAtRef.current) {
      blinkEndAtRef.current = t + 0.1 + Math.random() * 0.04;
      nextBlinkAtRef.current = t + 2.6 + Math.random() * 2.8;
    }

    const blinkValue = t < blinkEndAtRef.current ? 1 : 0;
    const alpha = Math.min(0.22, delta * 7);

    faceExpressions.forEach((name) => {
      const desired = name.startsWith("blink") ? blinkValue : target[name] || 0;
      const current = valuesRef.current[name] || 0;
      const next = lerp(current, desired, name.startsWith("blink") ? 0.55 : alpha);
      valuesRef.current[name] = next;
      safeSetExpression(vrm, name, next);
    });
  });
};

