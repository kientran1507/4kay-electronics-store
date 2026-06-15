"use client";

import type { TtsProvider, TtsSynthesisRequest } from "./ttsProvider";

export const browserSpeechSynthesisProvider: TtsProvider = {
  name: "browser",
  speak: (request: TtsSynthesisRequest) =>
    new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !request.text.trim()) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(request.text);
      if (request.browserVoice) utterance.voice = request.browserVoice;
      utterance.lang = request.browserVoice?.lang || request.lang;
      utterance.rate = request.browserSettings.rate;
      utterance.pitch = request.browserSettings.pitch;
      utterance.volume = 1;
      utterance.onstart = request.onStart;
      utterance.onboundary = () => request.onBoundary?.();
      utterance.onpause = () => request.onBoundary?.();
      utterance.onresume = () => request.onBoundary?.();
      utterance.onend = () => {
        request.onEnd();
        resolve();
      };
      utterance.onerror = () => {
        request.onEnd();
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    }),
  stop: () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  },
};

