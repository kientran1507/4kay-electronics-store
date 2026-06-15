"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
};

const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") console.log("[SpeechRecognition]", ...args);
};

export const useSpeechRecognition = ({
  lang = "en-US",
  onFinalTranscript,
  onInterimTranscript,
}: {
  lang?: string;
  onFinalTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");

  const [SpeechRecognitionCtor, setSpeechRecognitionCtor] = useState<any>(null);

  useEffect(() => {
    const Constructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
    setSpeechRecognitionCtor(() => Constructor);
  }, []);

  const supported = Boolean(SpeechRecognitionCtor);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus("");
  }, []);

  const start = useCallback(async () => {
    setError("");
    setStatus("");
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";

    if (!supported || !SpeechRecognitionCtor) {
      const message = "Speech recognition is not supported in this browser. Please test with Chrome or Edge.";
      setError(message);
      devLog("unsupported");
      return;
    }

    try {
      if (!window.isSecureContext) {
        throw new Error("Microphone access requires HTTPS or localhost.");
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone permission API is not available.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      devLog("permission granted");

      recognitionRef.current?.abort();
      const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        devLog("started", { lang });
        setIsListening(true);
        setStatus("Listening...");
        setError("");
      };

      recognition.onspeechstart = () => {
        devLog("speech started");
        setStatus("Listening...");
      };

      recognition.onspeechend = () => {
        devLog("speech ended");
        setStatus("Processing speech...");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let finalText = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0]?.transcript || "";
          if (event.results[index].isFinal) finalText += transcript;
          else interim += transcript;
        }

        const cleanInterim = interim.trim();
        const cleanFinal = finalText.trim();

        if (cleanInterim) {
          interimTranscriptRef.current = cleanInterim;
          setStatus(`Heard: ${cleanInterim}`);
          onInterimTranscript?.(cleanInterim);
          devLog("interim", cleanInterim);
        }

        if (cleanFinal) {
          finalTranscriptRef.current = cleanFinal;
          setStatus(`Sending: ${cleanFinal}`);
          onInterimTranscript?.(cleanFinal);
          onFinalTranscript(cleanFinal);
          devLog("final", cleanFinal);
        }
      };

      recognition.onerror = (event: any) => {
        const message = event?.error ? `Speech recognition error: ${event.error}` : "Speech recognition error.";
        devLog("error", event);
        setError(message);
        setStatus("");
        setIsListening(false);
      };

      recognition.onend = () => {
        devLog("ended", {
          final: finalTranscriptRef.current,
          interim: interimTranscriptRef.current,
        });
        setIsListening(false);
        if (!finalTranscriptRef.current) {
          setStatus(interimTranscriptRef.current ? "Speech ended. Review the text, then send." : "No speech was recognized. Please try again.");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      const message = err?.message || "Microphone permission denied.";
      devLog("permission/start error", err);
      setError(message);
      setStatus("");
      setIsListening(false);
    }
  }, [SpeechRecognitionCtor, lang, onFinalTranscript, onInterimTranscript, supported]);

  return {
    start,
    stop,
    isListening,
    supported,
    error,
    status,
  };
};
