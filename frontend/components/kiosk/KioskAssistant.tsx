"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { assistantApi } from "@/lib/apiCalls";
import { KioskResponse, KioskState } from "@/types";
import { useAuth } from "@/app/utils/authContext";
import useCart from "@/hooks/use-cart";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import KioskControls from "./KioskControls";
import KioskProductShelf from "./KioskProductShelf";
import KioskRecommendationPanel from "./KioskRecommendationPanel";
import KioskScene from "./KioskScene";
import AvatarSpeechBubble from "./AvatarSpeechBubble";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

const starterPrompts = [
  "I need a laptop under 20 million VND for programming and light gaming.",
  "Recommend me a phone with good camera and battery.",
  "I'm a student and I carry my laptop every day.",
  "I want the cheapest option but still good enough for office work.",
];

const initialResponse: KioskResponse = {
  reply: "Hi, I can help you choose a laptop, phone, or accessory. Tell me what you need and your budget.",
  spokenReply: "Hi, tell me what device you need and your budget.",
  intent: "greeting",
  needs: { category: "", budget: null, useCases: [], preferredBrands: [], importantFactors: [], minSpecs: {} },
  recommendedProducts: [],
  alternatives: [],
  comparison: { products: [], summary: "", winnerByUseCase: {} },
  followUpQuestion: "",
  kioskState: "greeting",
  actions: [],
};

const KioskAssistant = () => {
  const { user } = useAuth();
  const cart = useCart();
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [response, setResponse] = useState<KioskResponse>(initialResponse);
  const [kioskState, setKioskState] = useState<KioskState>("greeting");
  const [loading, setLoading] = useState(false);
  const lastSpokenRef = useRef("");
  const tts = useTextToSpeech();
  const {
    isSpeaking,
    speak,
    testVoice,
    setVoiceEnabled,
    supported: ttsSupported,
    voiceEnabled,
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    providerName,
    setProviderName,
    rate,
    setRate,
    pitch,
    setPitch,
    audioElement,
    speechBoundaryPulse,
  } = tts;

  useEffect(() => {
    const timer = window.setTimeout(() => setKioskState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const text = response.spokenReply || response.reply;
    if (!text || text === lastSpokenRef.current || !voiceEnabled || !ttsSupported) return;
    lastSpokenRef.current = text;
    setKioskState("talking");
    speak(text).then(() => {
      setKioskState(response.recommendedProducts.length > 0 ? "presenting" : response.kioskState === "comparing" ? "comparing" : "idle");
    });
  }, [response, speak, ttsSupported, voiceEnabled]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      setKioskState("thinking");
      setInput("");

      try {
        const next = await assistantApi.kiosk({
          message: trimmed,
          conversationId,
          userId: user?._id,
          selectedProductIds,
          context: { cartItemCount: cart.items.length },
        });
        setConversationId(next.conversationId);
        setResponse(next);
        setKioskState(next.kioskState || "talking");
      } catch {
        setResponse({
          ...initialResponse,
          reply: "The kiosk assistant could not reach the backend. Please try again.",
          kioskState: "error",
        });
        setKioskState("error");
      } finally {
        setLoading(false);
      }
    },
    [cart.items.length, conversationId, loading, selectedProductIds, user?._id],
  );

  const speech = useSpeechRecognition({
    lang: process.env.NEXT_PUBLIC_SPEECH_LANG || "en-US",
    onInterimTranscript: useCallback((value: string) => {
      setInput(value);
      setKioskState("listening");
    }, []),
    onFinalTranscript: useCallback(
      (value: string) => {
        setInput(value);
        sendMessage(value);
      },
      [sendMessage],
    ),
  });

  useEffect(() => {
    if (speech.isListening) {
      setKioskState("listening");
      return;
    }
    if (!loading && kioskState === "listening") {
      setKioskState(response.recommendedProducts.length ? "presenting" : "idle");
    }
  }, [kioskState, loading, response.recommendedProducts.length, speech.isListening]);

  const compareProduct = (productId: string) => {
    const nextIds = [...new Set([...selectedProductIds, productId])].slice(-2);
    setSelectedProductIds(nextIds);
    if (nextIds.length >= 2) sendMessage("Compare these two products");
  };

  const toggleMic = async () => {
    if (speech.isListening) speech.stop();
    else {
      setKioskState("listening");
      await speech.start();
    }
  };

  const handleTestVoice = () => {
    setKioskState("talking");
    testVoice().then(() => setKioskState(response.recommendedProducts.length ? "presenting" : "idle"));
  };

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid min-h-[calc(100vh-110px)] gap-6 lg:grid-cols-[minmax(420px,45%)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-5 lg:h-[calc(100vh-130px)]">
          <KioskScene
            state={loading ? "thinking" : kioskState}
            isSpeaking={isSpeaking}
            audioElement={audioElement}
            speechBoundaryPulse={speechBoundaryPulse}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <AvatarSpeechBubble reply={loading ? "Let me check the best options from the store catalog..." : response.reply} />

          {response.followUpQuestion && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
              {response.followUpQuestion}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <KioskProductShelf
            products={response.recommendedProducts}
            onAdd={(productId) => cart.addItem(productId)}
            onCompare={compareProduct}
            onAskWhy={(productName) => sendMessage(`Why is ${productName} a good choice?`)}
          />
            <KioskRecommendationPanel alternatives={response.alternatives} comparison={response.comparison} />
          </div>

          <KioskControls
            input={input}
            loading={loading}
            onInputChange={(value) => {
              setInput(value);
              setKioskState(value ? "listening" : "idle");
            }}
            onSubmit={() => sendMessage(input)}
            voiceEnabled={voiceEnabled}
            onVoiceEnabledChange={setVoiceEnabled}
            ttsSupported={ttsSupported}
            voices={voices}
            selectedVoiceName={selectedVoiceName}
            onSelectedVoiceNameChange={setSelectedVoiceName}
            onTestVoice={handleTestVoice}
            providerName={providerName}
            onProviderNameChange={setProviderName}
            rate={rate}
            onRateChange={setRate}
            pitch={pitch}
            onPitchChange={setPitch}
            speechSupported={speech.supported}
            isListening={speech.isListening}
            speechStatus={speech.status}
            speechError={speech.error}
            onMicToggle={toggleMic}
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="shrink-0 rounded-full border bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KioskAssistant;
