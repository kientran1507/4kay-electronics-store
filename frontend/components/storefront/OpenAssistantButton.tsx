"use client";

import { MessageCircle } from "lucide-react";

export default function OpenAssistantButton({ label = "Ask AI Assistant", className = "", prompt = "" }: { label?: string; className?: string; prompt?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-4kay-assistant", { detail: prompt }))}
      className={`flex w-fit items-center gap-2 rounded-xl bg-[#c87916] px-4 py-2 text-xs font-semibold text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4" />{label}
    </button>
  );
}
