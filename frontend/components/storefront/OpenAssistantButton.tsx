"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function OpenAssistantButton({ label, className = "", prompt = "" }: { label?: string; className?: string; prompt?: string }) {
  const { locale } = useLocale();
  const displayLabel = label || (locale === "vi" ? "Hỏi trợ lý AI" : "Ask AI Assistant");
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-4kay-assistant", { detail: prompt }))}
      className={`flex w-fit items-center gap-2 rounded-xl bg-[#c87916] px-4 py-2 text-xs font-semibold text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4" />{displayLabel}
    </button>
  );
}
