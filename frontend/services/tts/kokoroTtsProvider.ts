"use client";

import type { TtsProvider, TtsSynthesisRequest } from "./ttsProvider";

const kokoroUrl = process.env.NEXT_PUBLIC_KOKORO_TTS_URL || "http://localhost:8880";
const kokoroVoice = process.env.NEXT_PUBLIC_KOKORO_VOICE || "af_heart";

export const kokoroTtsProvider: TtsProvider = {
  name: "kokoro",
  speak: async (request: TtsSynthesisRequest) => {
    if (!request.audioElement) throw new Error("Kokoro TTS needs an audio element.");

    const response = await fetch(`${kokoroUrl.replace(/\/$/, "")}/v1/audio/speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kokoro",
        voice: kokoroVoice,
        input: request.text,
        response_format: "mp3",
      }),
    });

    if (!response.ok) throw new Error(`Kokoro TTS failed with ${response.status}`);

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
        reject(new Error("Kokoro audio playback failed."));
      };
      request.audioElement.play().catch(reject);
    });
  },
  stop: () => undefined,
};

