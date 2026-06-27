"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, getStoredLocale, Locale, setStoredLocale } from "@/lib/i18n";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(getStoredLocale());

    const handleLocale = (event: Event) => {
      const nextLocale = (event as CustomEvent<Locale>).detail;
      if (nextLocale === "en" || nextLocale === "vi") setLocaleState(nextLocale);
    };
    const handleStorage = () => setLocaleState(getStoredLocale());

    window.addEventListener("4kay-locale-change", handleLocale);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("4kay-locale-change", handleLocale);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setStoredLocale(nextLocale);
    setLocaleState(nextLocale);
  };

  return { locale, setLocale };
}
