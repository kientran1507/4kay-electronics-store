"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import type { Locale } from "@/lib/i18n";

const labels: Record<Locale, string> = {
  en: "EN",
  vi: "VI",
};

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const nextLocale: Locale = locale === "en" ? "vi" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className="flex h-9 items-center gap-1.5 rounded-md border border-[#e8ddcf] bg-white px-2.5 text-xs font-semibold text-[#111827] transition hover:bg-[#f7efe4]"
      title={locale === "en" ? "Switch to Vietnamese" : "Chuyển sang tiếng Anh"}
      aria-label={locale === "en" ? "Switch to Vietnamese" : "Switch to English"}
    >
      <Languages className="h-3.5 w-3.5" />
      {labels[locale]}
    </button>
  );
}
