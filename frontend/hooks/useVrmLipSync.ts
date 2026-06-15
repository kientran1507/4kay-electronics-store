"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { VRM } from "@pixiv/three-vrm";

const mouthExpressions = ["aa", "ih", "ou", "ee", "oh"];
const clamp = (value: number, min = 0, max = 0.85) => Math.max(min, Math.min(max, value));
const lerp = (from: number, to: number, alpha: number) => from + (to - from) * alpha;

const setExpression = (vrm: VRM, name: string, value: number) => {
  const manager = vrm.expressionManager;
  if (!manager) return;
  try {
    manager.setValue(name, clamp(value, 0, 1));
  } catch {
    if (process.env.NODE_ENV === "development") console.warn(`VRM mouth expression missing: ${name}`);
  }
};

export const resetMouthExpressions = (vrm?: VRM | null) => {
  if (!vrm) return;
  mouthExpressions.forEach((name) => setExpression(vrm, name, 0));
};

export const useVrmLipSync = ({
  vrm,
  isSpeaking,
  audioElement,
  speechBoundaryPulse = 0,
  intensity = 0.82,
  enabled = true,
}: {
  vrm?: VRM | null;
  isSpeaking: boolean;
  audioElement?: HTMLAudioElement | null;
  speechBoundaryPulse?: number;
  intensity?: number;
  enabled?: boolean;
}) => {
  const currentMouthRef = useRef(0);
  const pulseRef = useRef(0);
  const lastPulseRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!audioElement || typeof window === "undefined") return;
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;
      const context = new AudioContextCtor();
      const source = context.createMediaElementSource(audioElement);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(context.destination);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.warn("[VRM] audio analyser unavailable", error);
    }
  }, [audioElement]);

  useFrame(({ clock }) => {
    if (!vrm || !enabled) return;

    if (!isSpeaking) {
      currentMouthRef.current = lerp(currentMouthRef.current, 0, 0.35);
      if (currentMouthRef.current < 0.025) resetMouthExpressions(vrm);
      else setExpression(vrm, "aa", currentMouthRef.current);
      return;
    }

    let targetMouth = 0.12;

    if (analyserRef.current && dataRef.current && audioElement && !audioElement.paused) {
      analyserRef.current.getByteFrequencyData(dataRef.current);
      const average = dataRef.current.reduce((sum, value) => sum + value, 0) / dataRef.current.length;
      targetMouth = clamp((average / 255) * 1.25 * intensity, 0.02, 0.82);
    } else {
      if (speechBoundaryPulse !== lastPulseRef.current) {
        pulseRef.current = 0.78 * intensity;
        lastPulseRef.current = speechBoundaryPulse;
      }
      pulseRef.current = Math.max(0.12, pulseRef.current * 0.86);
      const syllableWave = 0.18 + Math.abs(Math.sin(clock.elapsedTime * 7.5)) * 0.28;
      targetMouth = clamp(Math.max(pulseRef.current, syllableWave * intensity), 0.04, 0.78);
    }

    currentMouthRef.current = lerp(currentMouthRef.current, targetMouth, 0.24);

    const time = clock.elapsedTime;
    const main = currentMouthRef.current;
    const sideViseme = main * 0.28;
    const activeSideIndex = 1 + (Math.floor(time * 2.2) % (mouthExpressions.length - 1));

    mouthExpressions.forEach((name, index) => {
      if (index === 0) setExpression(vrm, name, main);
      else setExpression(vrm, name, index === activeSideIndex ? sideViseme : 0);
    });
  });
};

