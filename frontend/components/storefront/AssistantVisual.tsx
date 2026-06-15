"use client";

import KioskScene from "@/components/kiosk/KioskScene";

export default function AssistantVisual({ message }: { message: string }) {
  return (
    <div className="relative h-full min-h-44 overflow-hidden rounded-2xl border border-[#eadcc8] bg-[#fff4e6]">
      <div className="absolute inset-x-0 -top-6"><KioskScene compact state="idle" isSpeaking={false} /></div>
      {message && <div className="absolute right-5 top-8 max-w-[48%] rounded-2xl border border-[#eadcc8] bg-white/95 p-4 text-sm leading-6 shadow-sm">{message}</div>}
    </div>
  );
}
