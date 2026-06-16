"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Play, Send, Settings, ShoppingCart, Volume2, X } from "lucide-react";
import { assistantApi } from "@/lib/apiCalls";
import { AssistantAlternative, AssistantResponse, AvatarState, RecommendedProduct } from "@/types";
import { useAuth } from "@/app/utils/authContext";
import { usePathname } from "next/navigation";
import useCart from "@/hooks/use-cart";
import { useAssistantTts } from "@/hooks/useAssistantTts";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import formatVND from "@/app/utils/formatCurrency";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: RecommendedProduct[];
  alternatives?: AssistantAlternative[];
};

const createMessageId = () =>
  `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const starterMessages = [
  "I need a laptop under 20 million VND for programming and light gaming",
  "Recommend me a phone with good camera and battery",
  "I'm a student and I need something durable",
  "I want the cheapest option but still good enough for office work",
];

const AIAssistant = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const cart = useCart();
  const tts = useAssistantTts();
  const [open, setOpen] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createMessageId(),
      role: "assistant",
      content: "Tell me what device you need, your budget, and what you will use it for. I will recommend products from the current catalog.",
    },
  ]);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const speech = useSpeechRecognition({
    lang: process.env.NEXT_PUBLIC_SPEECH_LANG || "en-US",
    onInterimTranscript: useCallback((text: string) => {
      setInput(text);
      setAvatarState("listening");
    }, []),
    onFinalTranscript: useCallback((text: string) => {
      setInput(text);
      setAvatarState("idle");
    }, []),
  });

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!open || loading || speech.isListening) return;
    const timer = window.setTimeout(() => setAvatarState("idle"), 1400);
    return () => window.clearTimeout(timer);
  }, [open, loading, messages, speech.isListening]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      setOpen(true);
      setAvatarState("listening");
      if (message) setInput(message);
    };
    window.addEventListener("open-4kay-assistant", handleOpen);
    return () => window.removeEventListener("open-4kay-assistant", handleOpen);
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    setAvatarState("thinking");
    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: "user", content: trimmed },
    ]);

    try {
      const response: AssistantResponse = await assistantApi.recommend({
        message: trimmed,
        conversationId,
        userId: user?._id,
        context: {
          source: "storefront-assistant",
          pathname,
          pageContext:
            pathname.startsWith("/product/") ? "User is viewing a product detail page."
              : pathname === "/shop" ? "User is browsing all products."
              : pathname.startsWith("/guides") ? "User is reading buying guides."
              : pathname === "/support" ? "User is viewing support topics."
              : pathname.startsWith("/customer-sign") || pathname === "/forgot-password" ? "User is using account authentication."
              : "User is browsing the storefront.",
        },
      });

      setConversationId(response.conversationId);
      setAvatarState(response.avatarState || "talking");
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: response.reply,
          products: response.recommendedProducts,
          alternatives: response.alternatives,
        },
      ]);
    } catch (error) {
      setAvatarState("idle");
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: "I could not reach the recommendation service. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  const toggleVoiceInput = async () => {
    if (speech.isListening) {
      speech.stop();
      setAvatarState("idle");
      return;
    }

    setAvatarState("listening");
    await speech.start();
  };

  const speak = async (text: string) => {
    setAvatarState("talking");
    await tts.speak(text);
    setAvatarState("idle");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-[min(420px,calc(100dvw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#eadcc8] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-full border border-[#eadcc8] bg-[#fff4e6]"><Image src="/images/ai-assistant-portrait.png" alt="4Kay AI assistant" fill className="object-cover" sizes="48px" /></span>
              <div>
                <p className="text-sm font-semibold text-gray-950">4Kay AI Assistant</p>
                <p className="text-xs text-emerald-600">Online</p>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceSettings((value) => !value)}
                aria-label="Voice settings"
                title="Voice settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close assistant">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showVoiceSettings && (
            <div className="flex items-center gap-2 border-b bg-[#fffaf3] px-4 py-3">
              <label htmlFor="assistant-voice" className="shrink-0 text-xs font-medium text-gray-700">
                Voice
              </label>
              <select
                id="assistant-voice"
                value={tts.selectedVoiceName}
                onChange={(event) => tts.setSelectedVoiceName(event.target.value)}
                disabled={!tts.supported || !tts.voices.length}
                className="h-9 min-w-0 flex-1 rounded-md border bg-white px-2 text-xs text-gray-700"
              >
                {!tts.voices.length && <option>No browser voices found</option>}
                {tts.voices.map((voice) => (
                  <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => speak("Hello! I am your 4Kay shopping assistant.")}
                disabled={!tts.supported}
              >
                <Play className="mr-1 h-3.5 w-3.5" />
                Test
              </Button>
            </div>
          )}

          <div ref={listRef} className="max-h-[52vh] min-h-[320px] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[88%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-gray-950 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && (
                  <button
                    className="ml-2 inline-flex align-bottom text-gray-400 hover:text-gray-700"
                    onClick={() => speak(message.content)}
                    aria-label="Read assistant response aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.products.map((recommendation) => (
                      <div key={recommendation.product._id} className="rounded-lg border bg-white p-3 text-left shadow-sm">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            {recommendation.product.image && (
                              <Image
                                src={recommendation.product.image}
                                alt={recommendation.product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold text-gray-950">{recommendation.product.name}</p>
                            <p className="mt-1 text-sm font-medium text-gray-800">{formatVND(recommendation.product.price)}</p>
                            <p className="text-xs text-gray-500">
                              {recommendation.product.stock > 0 ? `Stock: ${recommendation.product.stock}` : "Out of stock"}
                              {recommendation.product.rating ? ` · ${recommendation.product.rating}/5` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-gray-700">
                          <p><span className="font-semibold text-gray-950">Why:</span> {recommendation.reason}</p>
                          <p><span className="font-semibold text-gray-950">Trade-off:</span> {recommendation.tradeoff}</p>
                          <p><span className="font-semibold text-gray-950">Best for:</span> {recommendation.bestFor}</p>
                          {recommendation.betterThan && (
                            <p><span className="font-semibold text-gray-950">Compared:</span> {recommendation.betterThan}</p>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/product/${recommendation.product._id}`}>View details</Link>
                          </Button>
                          <Button size="sm" onClick={() => cart.addItem(recommendation.product._id)}>
                            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInput(`Compare ${recommendation.product.name} with `)}
                          >
                            Compare
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {message.alternatives && message.alternatives.length > 0 && (
                  <div className="mt-3 rounded-lg border border-dashed bg-gray-50 p-3 text-left">
                    <p className="text-xs font-semibold text-gray-950">Alternatives</p>
                    <div className="mt-2 space-y-2">
                      {message.alternatives.map((alternative) => (
                        <div key={alternative.product._id} className="text-xs text-gray-700">
                          <Link href={`/product/${alternative.product._id}`} className="font-medium text-gray-950 hover:underline">
                            {alternative.product.name}
                          </Link>
                          <span> - {alternative.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
                Thinking...
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="flex gap-2 overflow-x-auto border-t px-4 py-3">
              {starterMessages.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendMessage(starter)}
                  className="shrink-0 rounded-full border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={() => !loading && setAvatarState("listening")}
              onBlur={() => !loading && !speech.isListening && setAvatarState("idle")}
              placeholder="Ask for product advice..."
              className="h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleVoiceInput}
              aria-label={speech.isListening ? "Stop voice input" : "Start voice input"}
              title={speech.error || (speech.supported ? "Speak in English" : "Speech recognition requires Chrome or Edge")}
            >
              {speech.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {(speech.status || speech.error) && (
            <p className={`border-t px-4 py-2 text-xs ${speech.error ? "text-red-600" : "text-gray-600"}`}>
              {speech.error || speech.status}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => {
          setOpen((value) => !value);
          setAvatarState(open ? "idle" : "listening");
        }}
        className="flex h-14 items-center gap-2 rounded-full border border-[#e4bd85] bg-white pr-5 shadow-[0_8px_24px_rgba(120,72,20,0.16)]"
        aria-label="Open AI assistant"
      >
        <span className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[#e4bd85] bg-[#fff4e6]"><Image src="/images/ai-assistant-portrait.png" alt="" fill className="object-cover" sizes="56px" /></span>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-semibold text-[#111827]">Ask AI</span>
      </button>
    </div>
  );
};

export default AIAssistant;
