"use client";

export type TtsProviderName = "browser" | "kokoro" | "piper";

export interface BrowserVoiceSettings {
  voiceName: string;
  rate: number;
  pitch: number;
}

export interface TtsSynthesisRequest {
  text: string;
  lang: string;
  browserVoice?: SpeechSynthesisVoice | null;
  browserSettings: BrowserVoiceSettings;
  onStart: () => void;
  onEnd: () => void;
  onBoundary?: () => void;
  audioElement?: HTMLAudioElement | null;
}

export interface TtsProvider {
  name: TtsProviderName;
  speak: (request: TtsSynthesisRequest) => Promise<void>;
  stop: () => void;
}

export const ttsProviderLabel: Record<TtsProviderName, string> = {
  browser: "Browser",
  kokoro: "Kokoro",
  piper: "Piper",
};

