"use client";

import { FormEvent } from "react";
import { Play, Send, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import KioskVoiceInput from "./KioskVoiceInput";
import type { TtsProviderName } from "@/services/tts/ttsProvider";

const KioskControls = ({
  input,
  loading,
  onInputChange,
  onSubmit,
  voiceEnabled,
  onVoiceEnabledChange,
  ttsSupported,
  voices,
  selectedVoiceName,
  onSelectedVoiceNameChange,
  onTestVoice,
  providerName,
  onProviderNameChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  speechSupported,
  isListening,
  speechStatus,
  speechError,
  onMicToggle,
}: {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  ttsSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onSelectedVoiceNameChange: (voiceName: string) => void;
  onTestVoice: () => void;
  providerName: TtsProviderName;
  onProviderNameChange: (provider: TtsProviderName) => void;
  rate: number;
  onRateChange: (value: number) => void;
  pitch: number;
  onPitchChange: (value: number) => void;
  speechSupported: boolean;
  isListening: boolean;
  speechStatus: string;
  speechError: string;
  onMicToggle: () => void;
}) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Tell the kiosk what you need..."
          className="h-12 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
        />
        <KioskVoiceInput isListening={isListening} supported={speechSupported} error={speechError} onToggle={onMicToggle} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onVoiceEnabledChange(!voiceEnabled)}
          disabled={!ttsSupported}
          title={voiceEnabled ? "Turn voice off" : "Turn voice on"}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <details className="mt-3 rounded-md border bg-gray-50 px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-gray-700">
          <Settings className="h-3.5 w-3.5" />
          Voice settings
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 capitalize text-gray-500">{providerName}</span>
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-[140px_1fr_auto]">
          <select
            value={providerName}
            onChange={(event) => onProviderNameChange(event.target.value as TtsProviderName)}
            className="h-9 rounded-md border bg-white px-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-gray-200"
            title="TTS provider"
          >
            <option value="browser">Browser</option>
            <option value="kokoro">Kokoro</option>
            <option value="piper">Piper</option>
          </select>

          {providerName === "browser" ? (
            <select
              value={selectedVoiceName}
              onChange={(event) => onSelectedVoiceNameChange(event.target.value)}
              disabled={!ttsSupported || !voices.length}
              className="h-9 min-w-0 rounded-md border bg-white px-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-gray-200"
              title="Select assistant voice"
            >
              {!voices.length && <option>No voices loaded yet</option>}
              {voices.map((voice) => (
                <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-md border bg-white px-3 py-2 text-xs text-gray-600">
              Local {providerName} audio is used when its server is available; otherwise the browser voice is used.
            </div>
          )}

          <Button type="button" variant="outline" size="sm" onClick={onTestVoice} disabled={!ttsSupported || !voiceEnabled}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Test
          </Button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-gray-600">
            Speed {rate.toFixed(2)}
            <input
              type="range"
              min="0.75"
              max="1.15"
              step="0.01"
              value={rate}
              onChange={(event) => onRateChange(Number(event.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <label className="text-xs text-gray-600">
            Pitch {pitch.toFixed(2)}
            <input
              type="range"
              min="0.85"
              max="1.25"
              step="0.01"
              value={pitch}
              onChange={(event) => onPitchChange(Number(event.target.value))}
              disabled={providerName !== "browser"}
              className="mt-1 w-full"
            />
          </label>
        </div>
      </details>

      {(speechStatus || speechError || !speechSupported) && (
        <p className={`mt-2 text-xs ${speechError || !speechSupported ? "text-red-600" : "text-gray-600"}`}>
          {speechError || speechStatus || "Speech recognition is not supported in this browser. Please test with Chrome or Edge."}
        </p>
      )}
    </div>
  );
};

export default KioskControls;
