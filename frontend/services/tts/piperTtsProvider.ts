"use client";

import type { TtsProvider, TtsSynthesisRequest } from "./ttsProvider";

const piperUrl = process.env.NEXT_PUBLIC_PIPER_TTS_URL || "http://localhost:5002";
const piperVoice = process.env.NEXT_PUBLIC_PIPER_VOICE || "";

export const piperTtsProvider: TtsProvider = {
  name: "piper",
  speak: async (request: TtsSynthesisRequest) => {
    if (!request.audioElement) throw new Error("Piper TTS needs an audio element.");

    const response = await fetch(`${piperUrl.replace(/\/$/, "")}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: request.text, voice: piperVoice, lang: request.lang }),
    });

    if (!response.ok) throw new Error(`Piper TTS failed with ${response.status}`);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    request.audioElement.src = url;
    request.audioElement.playbackRate = request.browserSettings.rate;
    request.onStart();

    await new Promise<void>((resolve, reject) => {
      if (!request.audioElement) return reject(new Error("Missing audio element."));
      request.audioElement.onended = () => {
        URL.revokeObjectURL(url);
        request.onEnd();
        resolve();
      };
      request.audioElement.onerror = () => {
        URL.revokeObjectURL(url);
        request.onEnd();
        reject(new Error("Piper audio playback failed."));
      };
      request.audioElement.play().catch(reject);
    });
  },
  stop: () => undefined,
};

