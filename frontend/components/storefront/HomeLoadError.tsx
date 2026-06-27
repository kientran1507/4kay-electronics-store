"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function HomeLoadError() {
  const { locale } = useLocale();
  const vi = locale === "vi";
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#fffaf3] px-4">
      <section className="max-w-lg rounded-2xl border border-[#eadcc8] bg-white p-8 text-center shadow-[var(--store-shadow)]">
        <AlertTriangle className="mx-auto h-10 w-10 text-[#c87916]" />
        <h1 className="mt-4 text-2xl font-bold">{vi ? "Chưa thể tải sản phẩm" : "Products could not be loaded"}</h1>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">{vi ? "Cửa hàng đang gặp sự cố kết nối với API. Hãy thử tải lại sau ít phút." : "The store is having trouble connecting to the API. Please try again in a moment."}</p>
        <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-3 text-sm font-semibold text-white"><RotateCcw className="h-4 w-4" />{vi ? "Tải lại" : "Reload"}</Link>
      </section>
    </main>
  );
}
