"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { browserSpeechSynthesisProvider } from "@/services/tts/browserTtsProvider";
import { kokoroTtsProvider } from "@/services/tts/kokoroTtsProvider";
import { piperTtsProvider } from "@/services/tts/piperTtsProvider";
import type { BrowserVoiceSettings, TtsProviderName } from "@/services/tts/ttsProvider";

const VOICE_STORAGE_KEY = "kiosk-assistant-voice-name";
const ENABLED_STORAGE_KEY = "kiosk-assistant-voice-enabled";
const PROVIDER_STORAGE_KEY = "kiosk-assistant-tts-provider";
const RATE_STORAGE_KEY = "kiosk-assistant-tts-rate";
const PITCH_STORAGE_KEY = "kiosk-assistant-tts-pitch";

const preferredEnglishVoiceNames = [
  "microsoft aria",
  "microsoft jenny",
  "aria",
  "jenny",
  "google uk english female",
  "google us english",
  "ava",
  "samantha",
  "zira",
  "susan",
  "hazel",
  "female",
  "woman",
];

const avoidedMaleVoiceNames = ["david", "mark", "george", "guy", "male"];
const speechLang = process.env.NEXT_PUBLIC_SPEECH_LANG || "en-US";
const configuredProvider = (process.env.NEXT_PUBLIC_TTS_PROVIDER || "browser") as TtsProviderName;

const normalize = (value: string) => value.toLowerCase();
const isEnglishVoice = (voice: SpeechSynthesisVoice) =>
  /^en(?:[-_]|$)/i.test(voice.lang || "");
const isLikelyMaleVoice = (voice: SpeechSynthesisVoice) =>
  avoidedMaleVoiceNames.some((keyword) => normalize(`${voice.name} ${voice.voiceURI}`).includes(keyword));
const getVoiceRank = (voice: SpeechSynthesisVoice) => {
  const name = normalize(`${voice.name} ${voice.voiceURI}`);
  const preferredIndex = preferredEnglishVoiceNames.findIndex((keyword) => name.includes(keyword));
  const preferredScore = preferredIndex === -1 ? 0 : (preferredEnglishVoiceNames.length - preferredIndex) * 100;
  const qualityScore = /natural|neural|premium|enhanced/.test(name) ? 50 : 0;
  const languageScore = voice.lang?.toLowerCase() === speechLang.toLowerCase() ? 20 : 0;
  const genderPenalty = isLikelyMaleVoice(voice) ? 1000 : 0;
  return preferredScore + qualityScore + languageScore - genderPenalty;
};

const pickDefaultVoice = (voices: SpeechSynthesisVoice[], savedVoiceName: string | null) => {
  if (!voices.length) return "";
  const saved = savedVoiceName ? voices.find((voice) => voice.name === savedVoiceName) : null;
  if (saved) return saved.name;

  return [...voices].sort((first, second) => getVoiceRank(second) - getVoiceRank(first))[0].name;
};

const providerFor = (provider: TtsProviderName) => {
  if (provider === "kokoro") return kokoroTtsProvider;
  if (provider === "piper") return piperTtsProvider;
  return browserSpeechSynthesisProvider;
};

export const useAssistantTts = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceNameState] = useState("");
  const [voiceEnabled, setVoiceEnabledState] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [providerName, setProviderNameState] = useState<TtsProviderName>("browser");
  const [rate, setRateState] = useState(0.94);
  const [pitch, setPitchState] = useState(1.08);
  const [speechBoundaryPulse, setSpeechBoundaryPulse] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    audioRef.current = new Audio();
    setProviderNameState((window.localStorage.getItem(PROVIDER_STORAGE_KEY) as TtsProviderName) || configuredProvider || "browser");
    setVoiceEnabledState(window.localStorage.getItem(ENABLED_STORAGE_KEY) !== "false");
    setRateState(Number(window.localStorage.getItem(RATE_STORAGE_KEY)) || 0.94);
    setPitchState(Number(window.localStorage.getItem(PITCH_STORAGE_KEY)) || 1.08);

    if (!window.speechSynthesis) return;
    setSupported(true);

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const nextVoices = availableVoices.filter(isEnglishVoice);
      setVoices(nextVoices);
      setSelectedVoiceNameState((current) => {
        const currentIsAvailable = nextVoices.some((voice) => voice.name === current);
        return currentIsAvailable
          ? current
          : pickDefaultVoice(nextVoices, window.localStorage.getItem(VOICE_STORAGE_KEY));
      });
      if (process.env.NODE_ENV === "development") {
        console.log("[TTS] provider", configuredProvider, "voices", nextVoices.map((voice) => `${voice.name} (${voice.lang})`));
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.name === selectedVoiceName) || null,
    [selectedVoiceName, voices],
  );

  const setSelectedVoiceName = useCallback((voiceName: string) => {
    setSelectedVoiceNameState(voiceName);
    if (typeof window !== "undefined") window.localStorage.setItem(VOICE_STORAGE_KEY, voiceName);
  }, []);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setVoiceEnabledState(enabled);
    if (typeof window !== "undefined") window.localStorage.setItem(ENABLED_STORAGE_KEY, String(enabled));
    if (!enabled) browserSpeechSynthesisProvider.stop();
  }, []);

  const setProviderName = useCallback((provider: TtsProviderName) => {
    setProviderNameState(provider);
    if (typeof window !== "undefined") window.localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
  }, []);

  const setRate = useCallback((value: number) => {
    setRateState(value);
    if (typeof window !== "undefined") window.localStorage.setItem(RATE_STORAGE_KEY, String(value));
  }, []);

  const setPitch = useCallback((value: number) => {
    setPitchState(value);
    if (typeof window !== "undefined") window.localStorage.setItem(PITCH_STORAGE_KEY, String(value));
  }, []);

  const stop = useCallback(() => {
    browserSpeechSynthesisProvider.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const browserSettings: BrowserVoiceSettings = useMemo(
    () => ({ voiceName: selectedVoiceName, rate, pitch }),
    [pitch, rate, selectedVoiceName],
  );

  const speak = useCallback(
    async (text: string) => {
      if (!voiceEnabled || !text.trim()) return;
      stop();
      const requestedProvider = providerFor(providerName);

      const request = {
        text,
        lang: speechLang,
        browserVoice: selectedVoice,
        browserSettings,
        audioElement: audioRef.current,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onBoundary: () => setSpeechBoundaryPulse((value) => value + 1),
      };

      try {
        await requestedProvider.speak(request);
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.warn(`[TTS] ${providerName} failed, falling back to browser`, error);
        await browserSpeechSynthesisProvider.speak(request);
      }
    },
    [browserSettings, providerName, selectedVoice, stop, voiceEnabled],
  );

  const testVoice = useCallback(() => speak("Hi, I am your electronics sales assistant. How can I help you today?"), [speak]);

  return {
    speak,
    stop,
    testVoice,
    isSpeaking,
    supported,
    voices,
    selectedVoice,
    selectedVoiceName,
    setSelectedVoiceName,
    voiceEnabled,
    setVoiceEnabled,
    providerName,
    setProviderName,
    rate,
    setRate,
    pitch,
    setPitch,
    audioElement: audioRef.current,
    speechBoundaryPulse,
  };
};
